# aws-cdk-gatsby-contentful-sample

A demo project using AWS CDK to build the infrastructure and back end, Contentful to manage content, and GastbyJS to generate a static site from that.

## Getting started

### Accounts

- Create an AWS account
- Create a Contentful account

### Tools, frameworks, technologies

Install:

- Node.js 14.16.2
- AWS
  - CLI
  - SAM CLI
  - CDK
- gatsby-cli

### Initial setup

- Add your Contentful credentials to the .env files you wish to use.
- Configure your AWS profile locally.
- Run `cdk bootstrap` from inside the respective folder.
- Run `cdk deploy`. This is going to deploy all the infrastructure to your AWS account.
- Run `gatsby build` from inside the respective folder.
- Run `node deploy.js` to deploy the site to AWS.

## Useful resources

The goal here is not to teach how to configure or build projects with these tools, but simply to demonstrate an approach to this stack. Therefore, please refer to their respective official documentation if you get stuck.
