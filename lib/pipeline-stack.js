"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineStack = void 0;
const cdk = require("aws-cdk-lib");
const codepipeline = require("aws-cdk-lib/aws-codepipeline");
const codepipeline_actions = require("aws-cdk-lib/aws-codepipeline-actions");
const codebuild = require("aws-cdk-lib/aws-codebuild");
const iam = require("aws-cdk-lib/aws-iam");
class PipelineStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.PipelineStack = PipelineStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsNkRBQTZEO0FBQzdELDZFQUE2RTtBQUM3RSx1REFBdUQ7QUFDdkQsMkNBQTJDO0FBRzNDLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsb0JBQW9CO1FBQ3BCLE1BQU0sWUFBWSxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDakUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUM5QixLQUFLLEVBQUUsc0JBQXNCO2dCQUM3QixJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixPQUFPLEVBQUUsSUFBSTtnQkFDYixjQUFjLEVBQUU7b0JBQ2QsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO2lCQUNoRjthQUNGLENBQUM7WUFDRixXQUFXLEVBQUU7Z0JBQ1gsVUFBVSxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUMsWUFBWTtnQkFDbEQsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSzthQUN6QztZQUNELFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztTQUNuRSxDQUFDLENBQUM7UUFFSCx1Q0FBdUM7UUFDdkMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDbkQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztZQUN4QixPQUFPLEVBQUU7Z0JBQ1Asa0JBQWtCO2dCQUNsQixVQUFVO2dCQUNWLGNBQWM7Z0JBQ2QsTUFBTTtnQkFDTixZQUFZO2dCQUNaLE9BQU87Z0JBQ1AsT0FBTztnQkFDUCxRQUFRO2FBQ1Q7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakIsQ0FBQyxDQUFDLENBQUM7UUFFSixZQUFZO1FBQ1osTUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakQsTUFBTSxXQUFXLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFaEQsV0FBVztRQUNYLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDbkQsWUFBWSxFQUFFLG9CQUFvQjtZQUNsQyxNQUFNLEVBQUU7Z0JBQ047b0JBQ0UsU0FBUyxFQUFFLFFBQVE7b0JBQ25CLE9BQU8sRUFBRTt3QkFDUCxJQUFJLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDOzRCQUMxQyxVQUFVLEVBQUUsZUFBZTs0QkFDM0IsS0FBSyxFQUFFLHNCQUFzQjs0QkFDN0IsSUFBSSxFQUFFLGdCQUFnQjs0QkFDdEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQzs0QkFDMUQsTUFBTSxFQUFFLFlBQVk7NEJBQ3BCLE1BQU0sRUFBRSxNQUFNO3lCQUNmLENBQUM7cUJBQ0g7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsU0FBUyxFQUFFLE9BQU87b0JBQ2xCLE9BQU8sRUFBRTt3QkFDUCxJQUFJLG9CQUFvQixDQUFDLGVBQWUsQ0FBQzs0QkFDdkMsVUFBVSxFQUFFLFdBQVc7NEJBQ3ZCLE9BQU8sRUFBRSxZQUFZOzRCQUNyQixLQUFLLEVBQUUsWUFBWTs0QkFDbkIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO3lCQUN2QixDQUFDO3FCQUNIO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF4RUQsc0NBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGNvZGVwaXBlbGluZSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29kZXBpcGVsaW5lJztcbmltcG9ydCAqIGFzIGNvZGVwaXBlbGluZV9hY3Rpb25zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUtYWN0aW9ucyc7XG5pbXBvcnQgKiBhcyBjb2RlYnVpbGQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZCc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGNsYXNzIFBpcGVsaW5lU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBDb2RlQnVpbGQgcHJvamVjdFxuICAgIGNvbnN0IGJ1aWxkUHJvamVjdCA9IG5ldyBjb2RlYnVpbGQuUHJvamVjdCh0aGlzLCAnRUNvbW1lcmNlQnVpbGQnLCB7XG4gICAgICBzb3VyY2U6IGNvZGVidWlsZC5Tb3VyY2UuZ2l0SHViKHtcbiAgICAgICAgb3duZXI6ICdZT1VSX0dJVEhVQl9VU0VSTkFNRScsXG4gICAgICAgIHJlcG86ICdZT1VSX1JFUE9fTkFNRScsXG4gICAgICAgIHdlYmhvb2s6IHRydWUsXG4gICAgICAgIHdlYmhvb2tGaWx0ZXJzOiBbXG4gICAgICAgICAgY29kZWJ1aWxkLkZpbHRlckdyb3VwLmluRXZlbnRPZihjb2RlYnVpbGQuRXZlbnRBY3Rpb24uUFVTSCkuYW5kQnJhbmNoSXMoJ21haW4nKSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgYnVpbGRJbWFnZTogY29kZWJ1aWxkLkxpbnV4QnVpbGRJbWFnZS5TVEFOREFSRF83XzAsXG4gICAgICAgIGNvbXB1dGVUeXBlOiBjb2RlYnVpbGQuQ29tcHV0ZVR5cGUuU01BTEwsXG4gICAgICB9LFxuICAgICAgYnVpbGRTcGVjOiBjb2RlYnVpbGQuQnVpbGRTcGVjLmZyb21Tb3VyY2VGaWxlbmFtZSgnYnVpbGRzcGVjLnltbCcpLFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgcGVybWlzc2lvbnMgZm9yIENESyBkZXBsb3ltZW50XG4gICAgYnVpbGRQcm9qZWN0LmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdjbG91ZGZvcm1hdGlvbjoqJyxcbiAgICAgICAgJ2xhbWJkYToqJyxcbiAgICAgICAgJ2FwaWdhdGV3YXk6KicsXG4gICAgICAgICdzMzoqJyxcbiAgICAgICAgJ2R5bmFtb2RiOionLFxuICAgICAgICAnc2VzOionLFxuICAgICAgICAnaWFtOionLFxuICAgICAgICAnbG9nczoqJ1xuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuXG4gICAgLy8gQXJ0aWZhY3RzXG4gICAgY29uc3Qgc291cmNlT3V0cHV0ID0gbmV3IGNvZGVwaXBlbGluZS5BcnRpZmFjdCgpO1xuICAgIGNvbnN0IGJ1aWxkT3V0cHV0ID0gbmV3IGNvZGVwaXBlbGluZS5BcnRpZmFjdCgpO1xuXG4gICAgLy8gUGlwZWxpbmVcbiAgICBuZXcgY29kZXBpcGVsaW5lLlBpcGVsaW5lKHRoaXMsICdFQ29tbWVyY2VQaXBlbGluZScsIHtcbiAgICAgIHBpcGVsaW5lTmFtZTogJ2Vjb21tZXJjZS1waXBlbGluZScsXG4gICAgICBzdGFnZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHN0YWdlTmFtZTogJ1NvdXJjZScsXG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgbmV3IGNvZGVwaXBlbGluZV9hY3Rpb25zLkdpdEh1YlNvdXJjZUFjdGlvbih7XG4gICAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdHaXRIdWJfU291cmNlJyxcbiAgICAgICAgICAgICAgb3duZXI6ICdZT1VSX0dJVEhVQl9VU0VSTkFNRScsXG4gICAgICAgICAgICAgIHJlcG86ICdZT1VSX1JFUE9fTkFNRScsXG4gICAgICAgICAgICAgIG9hdXRoVG9rZW46IGNkay5TZWNyZXRWYWx1ZS5zZWNyZXRzTWFuYWdlcignZ2l0aHViLXRva2VuJyksXG4gICAgICAgICAgICAgIG91dHB1dDogc291cmNlT3V0cHV0LFxuICAgICAgICAgICAgICBicmFuY2g6ICdtYWluJyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzdGFnZU5hbWU6ICdCdWlsZCcsXG4gICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgbmV3IGNvZGVwaXBlbGluZV9hY3Rpb25zLkNvZGVCdWlsZEFjdGlvbih7XG4gICAgICAgICAgICAgIGFjdGlvbk5hbWU6ICdDb2RlQnVpbGQnLFxuICAgICAgICAgICAgICBwcm9qZWN0OiBidWlsZFByb2plY3QsXG4gICAgICAgICAgICAgIGlucHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICAgICAgICAgIG91dHB1dHM6IFtidWlsZE91dHB1dF0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxufSJdfQ==