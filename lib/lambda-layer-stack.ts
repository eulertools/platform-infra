import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaLayersConstruct } from "./constructs/layers-construct";

export class LambdaLayerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new LambdaLayersConstruct(this, "PlatformLayers");
  }
}
