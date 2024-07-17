import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"

// Initialize the Bedrock client with your region
const bedrockClient = new BedrockRuntimeClient({ region: "us-west-2" })

async function findCoordinateOf(image: any, description:string) {
    console.log("Looking for ", description)

    // Convert image Buffer to a Base64 string
    const buffer = Buffer.from(image.content, "binary")
     const base64Image = buffer.toString('base64');

    // modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    // modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    // prepare Claude 3 prompt
    const systemPrompt = "You are an expert at testing user interface of web applications. " +
        "You will be provided with a screenshot of a web application interface. " +
        "Analyze the attached screenshot very carefully because you will be asked very detailed questions about it. " +
        "You need to answer without preamble with a JSON object containing the following attributes: \"x_coordinate\", \"y_coordinate\", \"width\", \"height\" " +
        "and \"description\".The \"width\" should contain the width in pixel of the full screenshot. " +
        "The \"height\" should contain the height in pixel of the full screenshot. " +
        "The \"description\" should be a concise explanation of your reasoning process. " +
        "The \"x_coordinate\" and \"y_coordinate\" should contain the absolute coordinate in pixel of a specific element in the picture, with x-coordinate from the left edge and y-coordinate from the top edge."

    const userPrompt = "The attached picture is a screenshot of a web application that you are testing." +
        "You need find the X and Y coordinate of an element in that screenshot. " +
        "The element description is enclosed in the \"ELEMENT\" tag. " +
        "If the element is not found, put the value -1. Here is the element description you need to find: " +
        "<ELEMENT>"+description+"</ELEMENT>";

    const params = {
        modelId: process.env.MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            "system": systemPrompt,
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048,
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": base64Image
                            }
                        },
                        {
                            "type": "text",
                            "text" : userPrompt
                        }
                    ]
                },
            ],
        }),
    }

    // Create the command object
    const command = new InvokeModelCommand(params)

    try {
        // Use the client to send the command
        const response = await bedrockClient.send(command)
        const textDecoder = new TextDecoder("utf-8")
        const response_body = JSON.parse(textDecoder.decode(response.body))
        console.log("response_body",response_body)
        const result =  JSON.parse(response_body.content[0].text)
        return {
            statusCode: 200,
            result
        }
    } catch (err: any) {
        console.error("Error invoking Bedrock:", err)
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Failed to upload the file",
                error: err.message,
            }),
        }
    }
}

export default findCoordinateOf
