import * as core from '@actions/core'
import Terraform from './terraform'
import * as parser from 'action-input-parser'

export default async function main() {
    try {
        const token = parser.getInput('tfToken'),
              org = parser.getInput('tfOrg'),
              workspace = parser.getInput('tfWorkspace'),
              filePath = parser.getInput('filePath'),
              identifier = parser.getInput('identifier'),
              awaitApply = parser.getInput('awaitApply'),
              awaitInterval = parser.getInput('awaitInterval') * 1000,
              retryLimit = parser.getInput('retryLimit'),
              vars = parser.getInput('tfVars', {
                  type: 'array'
              })

        const tf = new Terraform(token, org, `app.terraform.io`, awaitApply, retryLimit, awaitInterval)

        const processedVars = vars.map(item => {
            const [key, value] = item.split('=');
            return { key, value };
        });
        console.log(processedVars)
        core.setOutput("tfVars", processedVars);

        const { runId, status } = await tf.run(workspace, filePath, identifier, processedVars)
        console.log(`Workspace run submitted succesfully: https://app.terraform.io/app/${org}/workspaces/${workspace}/runs/${runId}`)
        console.log(`Run status: ${status}`)
        core.setOutput("runId", runId);
        core.setOutput("status", status);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()
