import { CfnOutput, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";

interface ConstructStackProps{
  privateZone: IHostedZone;
  publicZone: IHostedZone;
  domainName: string;
}

export class CertificateConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: ConstructStackProps) {
    super(scope, id);

    const { privateZone, publicZone, domainName } = props!;

    const privateCertificate = new certificatemanager.Certificate(
      this,
      "Private",
      {
        domainName: `${domainName}.${privateZone.zoneName}`,
        subjectAlternativeNames: [`*.${domainName}.${privateZone.zoneName}`],
        validation:
          certificatemanager.CertificateValidation.fromDns(privateZone),
      }
    );

    const publicCertificate = new certificatemanager.Certificate(
      this,
      "Public",
      {
        domainName: `api.${publicZone.zoneName}`,
        subjectAlternativeNames: [`*.${domainName}.${publicZone.zoneName}`],
        validation:
          certificatemanager.CertificateValidation.fromDns(publicZone),
      }
    );

    new ssm.StringParameter(this, "PublicCertificate", {
      stringValue: publicCertificate.certificateArn,
      parameterName: `/certificates/${domainName}/public`,
    });

    new ssm.StringParameter(this, "PrivateCertificate", {
      stringValue: privateCertificate.certificateArn,
      parameterName: `/certificates/${domainName}/private`,
    });
  }
}
