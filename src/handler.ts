const multipart = require("aws-lambda-multipart-parser")

import uploadToS3 from "./utils/s3Utils"
import findCoordinateOf from "./utils/bedrockUtils"

const handler = async function (event: any, context: any) {
    let statusCode = 400
    let bodyResult = null

    try {
        let method = event.httpMethod
        console.log("method", method)
        if (method != "POST" || event.path !== "/") {
            // We only accept POST
            bodyResult = "We only accept POST /"
        } else {
            // parse the base64 from the API Gateway
            const base64Body = event.body
            const buff = Buffer.from(base64Body, "base64")
            const decodedEventBody = buff.toString("latin1")
            const decodedEvent = { ...event, body: decodedEventBody }
            const formObject = multipart.parse(decodedEvent, false)

            // productImage is the form-data key associated to the file in the multipart
            const {screenshot, description} = formObject

            // Example of getting description from Bedrock
            const bedRockResult = await findCoordinateOf(screenshot,description)
            if (bedRockResult.statusCode != 200) {
                return bedRockResult // return the error as is
            } else {
                statusCode = 200
                const { result } = bedRockResult
                bodyResult = {
                    result,
                }
            }

            // // Optional :  Example of uploading the file in S3
            // const s3result = await uploadToS3(screenshot)
            //
            // if (s3result.statusCode == 200) {
            //     const { fileName } = s3result
            //     bodyResult = { ...bodyResult, fileName }
            // }
        }
    } catch (error) {
        if (error instanceof Error) {
            bodyResult = error.stack
        } else {
            bodyResult = error
        }
    }

    const result = {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyResult),
    }
    console.log("final result", result)
    return result
}

export { handler }
