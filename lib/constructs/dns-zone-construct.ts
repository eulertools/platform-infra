import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";

interface AppStackProps extends StackProps {
  domainName: string;
  vpc: IVpc;
}

export class DnsZoneConstruct extends Construct {
  public readonly privateZone: IHostedZone;
  public readonly publicZone: IHostedZone;

  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id);

    const {domainName, vpc} = props!;

    const privateZone = new route53.HostedZone(this, 'PrivateZone', {
      zoneName: `${domainName}`,
      vpcs: [vpc]
    });

    this.privateZone = privateZone;

    const publicZone = new route53.HostedZone(this, 'PublicZone', {
      zoneName: `${domainName}`,
    });

    this.publicZone = publicZone;

    const googleRecords = new route53.MxRecord(this, 'GoogleMXRecord', {
        zone: publicZone,
        values: [
          {
            hostName: 'aspmx.l.google.com',
            priority: 1,
          },
          {
            hostName: 'alt1.aspmx.l.google.com',
            priority: 5,
          },
          {
            hostName: 'alt2.aspmx.l.google.com',
            priority: 5,
          },
          {
            hostName: 'alt3.aspmx.l.google.com',
            priority: 10,
          },
          {
            hostName: 'alt4.aspmx.l.google.com',
            priority: 10
          }
        ]
      }
    );

    const googleSpf = new route53.TxtRecord(this, 'GoogleSpfRecord', {
      zone: publicZone,
      values: [
        'v=spf1 include:_spf.google.com ~all',
        'google-site-verification=6tTalLzrBXBO4Gy9700TAbpg2QTKzGYEuZ_Ls69jle8',
      ]
    });

    const vercelARecord = new route53.ARecord(this, 'VercelARecord', {
      zone: publicZone,
      target: route53.RecordTarget.fromIpAddresses('76.76.21.21')
    });

    const vercelCnameRecord = new route53.CnameRecord(this, 'VercelCnameRecord', {
      zone: publicZone,
      recordName: 'www',
      domainName: 'pox.me'
    });

    new ssm.StringParameter(this, 'PublicZoneSsm', {
      stringValue: publicZone.zoneName,
      parameterName: `/hostedzone/${domainName}/public`,
    });

    new ssm.StringParameter(this, 'PrivateZoneSsm', {
      stringValue: privateZone.zoneName,
      parameterName: `/hostedzone/${domainName}/private`,
    });
  }
}

``
