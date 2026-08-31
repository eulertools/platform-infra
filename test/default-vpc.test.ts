import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { DefaultVpc } from "../lib/default-vpc";
import { LegacyVpc } from "../lib/legacy-vpc";

describe("Vpc Stack", () => {
  test("Default VPC Created", () => {
    const app = new cdk.App();
    const stack = new DefaultVpc(app, "default-vpc-stack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::EC2::VPC", {});
  });

  test("Legacy VPC Created", () => {
    const app = new cdk.App();
    const stack = new LegacyVpc(app, "legacy-vpc-stack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::EC2::VPC", {});
  });
});
