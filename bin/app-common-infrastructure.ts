import * as cdk from "aws-cdk-lib";
import { DevopsAccountInfrastructureStack } from "../lib/devops-account-infrastructure-stack";
import { LambdaLayerStack } from "../lib/lambda-layer-stack";

const app = new cdk.App();

const hostedZone = "pox.me"

new DevopsAccountInfrastructureStack(app, "BasicInfraUSE", {
  domainName: hostedZone,
  vpcEnabled: true,
  hostedZoneMain: true,
  description:
    "Bootstrap your AWS Account to support the poxme platform deploys",
  tags: { owner: hostedZone },
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new LambdaLayerStack(app, "LambdaCommonLayers", {
  tags: { owner: hostedZone },
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
