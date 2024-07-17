#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LocateInPictureStack } from '../lib/locate_in_picture-stack';

export const lambdaFunctionName = "LocateInPictureFunction"


const app = new cdk.App();
new LocateInPictureStack(app, 'LocateInPictureStack', {
    functionName: lambdaFunctionName,
});