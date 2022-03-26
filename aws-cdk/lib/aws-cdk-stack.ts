import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, Distribution, HttpVersion, LambdaEdgeEventType, OriginAccessIdentity, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { experimental } from 'aws-cdk-lib/aws-cloudfront';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';


// THE DOMAIN FOR THIS SITE MUST BE SET UP ON ROUTE53 BEFORE DEPLOYING THIS STACK


export interface StaticSiteProps extends StackProps {
  domainName: string;
}

export class AwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id, props);

    const shortDomain = props.domainName;
    const fullDomain = `www.${shortDomain}`;


    // Route53 Hosted Zone
    const zone = HostedZone.fromLookup(this, 'HostedZone', { domainName: shortDomain });


    // S3 Bucket to host the website
    const bucket = new Bucket(this, 'WebsiteBucket', {
      bucketName: 'aws-cdk-gatsby-contentful-sample',
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });


    // CloudFront OAI
    const oai = new OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: 'Origin Access Identity for aws-cdk-gatsby-contentful-sample'
    });


    // Allow CloudFront OAI to access the S3 Bucket
    bucket.addToResourcePolicy(new PolicyStatement({
      actions: [ 's3:GetObject' ],
      resources: [ bucket.arnForObjects('*') ],
      principals: [
        new CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)
      ]
    }));


    // TLS Certificate
    const certificate = new DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: fullDomain,
      hostedZone: zone,
      region: 'us-east-1'
    });


    // Lambda@Edge Redirect
    const lambdaRedirect = new experimental.EdgeFunction(this, 'LambdaEdgeRedirect', {
      functionName: 'LambdaEdgeRedirect',
      code: Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: 'viewer-request.handler',
      runtime: Runtime.NODEJS_14_X
    });


    // CloudFront Distribution
    const distribution = new Distribution(this, 'CloudFrontDistribution', {
      certificate: certificate,
      httpVersion: HttpVersion.HTTP2,
      defaultRootObject: 'index.html',
      domainNames: [
        shortDomain,
        fullDomain
      ],
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: '/404/index.html',
          ttl: Duration.minutes(30)
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404/index.html',
          ttl: Duration.minutes(30)
        }
      ],
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity: oai, originPath: '/dist' }),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: [
          {
            eventType: LambdaEdgeEventType.VIEWER_REQUEST,
            functionVersion: lambdaRedirect
          }
        ]
      },
    });


    // Route53 Alias Record
    const aliasRecord = new ARecord(this, 'SiteAliasRecord', {
      recordName: fullDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: zone
    });
  }
}
