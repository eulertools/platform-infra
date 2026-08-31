import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { DnsZoneConstruct } from "./constructs/dns-zone-construct";
import * as ssm from "aws-cdk-lib/aws-ssm";

interface DevopsInfraProps extends StackProps {
  domainName: string;
  vpcEnabled: boolean;
  hostedZoneMain: boolean;
}

export class DevopsAccountInfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: DevopsInfraProps) {
    super(scope, id, props);
    const {domainName, vpcEnabled, hostedZoneMain} = props!;

    if (vpcEnabled) {
    // Common VPCs
      const vpc = new ec2.Vpc(this, "VPC", {
        maxAzs: 3,
        subnetConfiguration: [
          {
            name: "private",
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            cidrMask: 24,
          },
          {
            name: "public",
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24,
          },
          {
            name: "isolated",
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            cidrMask: 28,
          },
        ],
      });

      new ssm.StringParameter(this, "SSMVpc", {
        stringValue: vpc.vpcId,
        parameterName: "/vpc/vpc/id/default",
      });

      if (hostedZoneMain) {
        new DnsZoneConstruct(this, "DnsZone", {
          domainName,
          vpc
        });
      }
    }

    // Common infrastructure buckets
    const s3Bucket = new s3.Bucket(this, "PipelineArtifacts", {
      removalPolicy: RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          enabled: true,
          expiration: Duration.days(30),
        },
      ],
      autoDeleteObjects: true,
    });

    new ssm.StringParameter(this, "ArtifactsBucket", {
      description: "S3 bucket to use in all pipeline artifacts",
      stringValue: s3Bucket.bucketName,
      parameterName: "SharedArtifactsBucket",
    });
  }
}
