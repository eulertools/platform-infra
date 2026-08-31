import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface ConstructProps extends StackProps {
  vpc: IVpc;
}

export class defaultSecurityGroupConstruct extends Construct {
  constructor(stack: Stack, id: string, props?: ConstructProps) {
    super(stack, id);

    const { vpc } = props!;

    const httpsGroup = new ec2.SecurityGroup(this, 'Https', {
      vpc,
      allowAllOutbound: true,
      description: 'Allows http and https traffic to reach the service',
    })

    httpsGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allows incoming http traffic')
    httpsGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allows incoming https traffic')
    httpsGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(80), 'Allows incoming http traffic')
    httpsGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(443), 'Allows incoming https traffic')

    const sshAccess = new ec2.SecurityGroup(this, 'Ssh', {
      vpc,
      allowAllOutbound: true,
      description: 'Allows ssh traffic to reach the service',
    })

    new ssm.StringParameter(this, 'SecGroupHttpsParam', {
      parameterName: `/vpc/security-group/https`,
      stringValue: httpsGroup.securityGroupId
    })

    new ssm.StringParameter(this, 'SecGroupSshParam', {
      parameterName: `/vpc/security-group/ssh`,
      stringValue: sshAccess.securityGroupId
    })
  }
}
