import * as byline from "byline";
import * as fs from "fs";
import {IUploadFile} from "./graphql/middleware/schema";

export interface ISwcRow {
    sampleNumber: number;
    structure: number;
    x: number
    y: number;
    z: number;
    radius: number;
    parentNumber: number;
}

export interface ISwcParseResult {
    rows: Array<ISwcRow>;
    janeliaOffsetX: number;
    janeliaOffsetY: number;
    janeliaOffsetZ: number;
    comments: string;
}

export async function swcParse(file: IUploadFile): Promise<any> {
    const stream = byline(fs.createReadStream(file.path, {encoding: 'utf8'}));

    let parseOutput: ISwcParseResult = {
        rows: [],
        janeliaOffsetX: 0,
        janeliaOffsetY: 0,
        janeliaOffsetZ: 0,
        comments: ""
    };

    return new Promise((resolve) => {
        stream.on('data', line => {
            onData(line, parseOutput)
        });

        stream.on('end', () => {
            onComplete(file, parseOutput, resolve);
        });
    });
}

function onData(line, parseOutput) {
    let data = line.trim();

    if (data.length > 0) {
        if (data[0] == '#') {
            parseOutput.comments += data + '\n';

            if (data.startsWith('# OFFSET')) {
                const sub = data.substring(9);
                const points = sub.split(/\s/);
                if (points.length === 3) {
                    const x = parseFloat(points[0]);
                    const y = parseFloat(points[1]);
                    const z = parseFloat(points[2]);

                    if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
                        parseOutput.janeliaOffsetX = x;
                        parseOutput.janeliaOffsetY = y;
                        parseOutput.janeliaOffsetZ = z;
                    }
                }
            }
        } else {
            data = data.split(/\s/);
            if (data.length == 7) {
                const sample: ISwcRow = {
                    sampleNumber: parseInt(data[0]),
                    structure: parseInt(data[1]),
                    x: parseFloat(data[2]),
                    y: parseFloat(data[3]),
                    z: parseFloat(data[4]),
                    radius: parseFloat(data[5]),
                    parentNumber: parseInt(data[6])
                };
                if (isNaN(sample.sampleNumber) || isNaN(sample.parentNumber)) {
                    // console.log('Unexpected line in swc file - not a comment and sample and/or parent number is NaN');
                } else {
                    parseOutput.rows.push(sample);
                }
            }
        }
    }
}

function onComplete(file, parseOutput, resolve) {
    // Remove temporary upload
    fs.unlinkSync(file.path);

    resolve(parseOutput);
}
