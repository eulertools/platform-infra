import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { LayerConstruct } from "./layer-construct/layer-constructs";

export class LambdaLayersConstruct extends Construct {
  public readonly layers: any;

  constructor(stack: Stack, id: string, props?: StackProps) {
    super(stack, id);

    this.layers = {};

    const dynamodbLayer = new LayerConstruct(stack, "DynamoDBLayer", {
      layerName: "dynamodb",
      description: "Layer utility for dynamodb",
    });

    this.layers["dynamodb"] = dynamodbLayer.layer;

    const opensearchLayer = new LayerConstruct(stack, "OpenSearchLayer", {
      layerName: "opensearch",
      description: "Layer utility for opensearch",
    });

    this.layers["opensearch"] = opensearchLayer.layer;

    const s3UtilsLayer = new LayerConstruct(stack, "S3UtilsLayer", {
      layerName: "s3-utils",
      description: "Layer utility for s3",
    });

    this.layers["s3-utils"] = s3UtilsLayer.layer;

    const httpUtilsLayer = new LayerConstruct(stack, "HttpUtilsLayer", {
      layerName: "http-utils",
      description: "Layer utility for http",
    });

    this.layers["http-utils"] = httpUtilsLayer.layer;

    const web3Layer = new LayerConstruct(stack, "Web3UtilsLayer", {
      layerName: "web3",
      description: "Layer utility for web3",
    });

    this.layers["web3"] = httpUtilsLayer.layer;
  }
}
