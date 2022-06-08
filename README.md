# Gitlab Permission Analyzer

A tool to produce a simple report about users and what repos they can access. Should be run with the most upper administrator access token

## How to run

1. Put the token in the `.env` file (see sample file `.env.sample`)
2. run `npm install`
2. Run `npm start`
3.  the report in the `reports` folder.

## Example with images

### Create Access token (with admin user )

![step1](./doc.files/1.make.pat.png)

### Run `npm start` to generate a report

![step2](./doc.files/2.npm.start.png)

## Example result 

![step3](./doc.files/3.open.report.png)

