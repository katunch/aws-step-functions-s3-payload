AWS Step Function S3 Payload
============================

# Usage
## ASL Definition:
```json
{
    "Comment": "Your Awesome State Machine",
    "StartAt": "first-step",
    "States": {
        "first-step": {
            "Type": "Task",
            "Resource": "arn:aws:states:::lambda:invoke",
            "OutputPath": "$.Payload",
            "Parameters": {
                "FunctionName": "arn:aws:lambda:[AWS_REGION]:[AWS_ACCOUNT_ID]:function:[LAMBDA_FUNCTION_NAME]",
                "Payload": {
                  "input.$": "$",
                  "context": {
                    "StateMachine.$": "$$.StateMachine.Name",
                    "Execution.$": "$$.Execution.Name",
                    "State.$": "$$.State.Name"
                  }
                }
            },
            "End": true
        }
    }
}

```

## Lambda Handler
Ensure that you set the environment variable `S3_BUCKET` to a valid bucket name.

```javascript
const S3PayloadUtils = require('@katunch/aws-step-functions-s3-payload');

module.exports.handler = async (event, context) => {
    const payload = await S3PayloadUtils.getPayloadFromS3(event);

    let result = {};
    // do your work here...

    const payloadUrl = await S3PayloadUtils.savePayloadToS3(event.context, result);
    return {
        payloadUrl: payloadUrl
    }
}
```

## Invocation
```javascript
const { DateTime } = require('luxon');
const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();
const STATEMACHINE_ARN='[YOUR STATE MACHINE ARN]';

const invokeStateMachine = async () => {
    const startTime = DateTime.now();
    const executionParams = {
        stateMachineArn: STATEMACHINE_ARN,
        input: JSON.stringify({
            'payloadUrl': 's3://your-bucket/key/to/file.json'
        }),
        name: `${startTime.toFormat('yyyyMMdd-HHmmss')}-${startTime.toMillis()}-${invoiceIds.length}`
    };
    console.log(`Starting State Machine Execution: ${executionParams.name}`);
    const sfResult = await stepFunctions.startExecution(executionParams).promise();
    return sfResult;
}
```

