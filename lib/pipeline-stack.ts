import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CodeBuild project
    const buildProject = new codebuild.Project(this, 'ECommerceBuild', {
      source: codebuild.Source.gitHub({
        owner: 'YOUR_GITHUB_USERNAME',
        repo: 'YOUR_REPO_NAME',
        webhook: true,
        webhookFilters: [
          codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main'),
        ],
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
    });

    // Grant permissions for CDK deployment
    buildProject.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudformation:*',
        'lambda:*',
        'apigateway:*',
        's3:*',
        'dynamodb:*',
        'ses:*',
        'iam:*',
        'logs:*'
      ],
      resources: ['*'],
    }));

    // Artifacts
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // Pipeline
    new codepipeline.Pipeline(this, 'ECommercePipeline', {
      pipelineName: 'ecommerce-pipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: 'YOUR_GITHUB_USERNAME',
              repo: 'YOUR_REPO_NAME',
              oauthToken: cdk.SecretValue.secretsManager('github-token'),
              output: sourceOutput,
              branch: 'main',
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CodeBuild',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
      ],
    });
  }
}