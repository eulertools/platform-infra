import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';
import { BuildSpecContent } from './buildspec-content';
import { aws_iam, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as lambda from "aws-cdk-lib/aws-lambda";
import {IBucket} from "aws-cdk-lib/aws-s3";

interface PipelineProps extends StackProps {
  githubRepo: string;
  branchName: string;
  packageName: string;
  compatibility: string[];
  bucket: IBucket;
}

export class LambdaLayerConstruct extends Construct {
  constructor(stack: Stack, id: string, props?: PipelineProps) {
    super(stack, id);

    const { githubRepo, branchName, packageName, compatibility, bucket } = props!;

    const nodejsLayer = new lambda.LayerVersion(this, 'Layer', {
      layerVersionName: packageName,
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X, lambda.Runtime.NODEJS_14_X],
      code: lambda.Code.fromAsset(`src/lambda-layer/${packageName}`),
    });

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const githubSourceAction = new GitHubSourceAction({
      actionName: 'GithubTrigger',
      output: sourceOutput,
      owner: 'eulertools',
      repo: githubRepo,
      branch: branchName,
      oauthToken: SecretValue.secretsManager('github-token'),
    });

    const codeBuildProject = new PipelineProject(stack, `${packageName}CodeBuild`, {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      environmentVariables: {
        ACCOUNT_ID: {
          value: process.env.CDK_DEFAULT_ACCOUNT,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        ACCOUNT_REGION: {
          value: process.env.CDK_DEFAULT_REGION,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        LAYER_NAME: {
          value: nodejsLayer,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        PACKAGE_NAME: {
          value: packageName,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        COMPATIBILITY: {
          value: compatibility.join(' '),
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      buildSpec: BuildSpec.fromObject(BuildSpecContent),
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER, LocalCacheMode.CUSTOM),
    });

    const buildAction = new CodeBuildAction({
      actionName: 'SourceAction',
      input: sourceOutput,
      project: codeBuildProject,
      outputs: [buildOutput],
    });

    codeBuildProject.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['lambda:*'],
        effect: aws_iam.Effect.ALLOW,
        resources: ['*'],
      })
    );

    new codepipeline.Pipeline(this, `CodePipeline`, {
      artifactBucket: bucket,
      stages: [
        {
          stageName: 'Source',
          actions: [githubSourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
      ],
    });

    new ssm.StringParameter(this, `${packageName}SSMParameter`, {
      stringValue: nodejsLayer.layerVersionArn,
      parameterName: `/lambda/layers/${packageName}`,
    });
  }
}
