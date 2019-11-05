import moment = require("moment");

const debug = require("debug")("mnb:swc-api:swc");

import {SwcNode} from "../models/swc/tracingNode";
import {SwcTracing} from "../models/swc/tracing";
import {StructureIdentifier} from "../models/swc/structureIdentifier";

export async function swcExportMiddleware(req, res) {
    const id: string = req.body.id;

    let response = null;

    if (!id) {
        debug(`null swc id request`);
    } else {
        debug(`handling swc request for id: ${id}`);

        const tracing = await SwcTracing.findByPk(id);

        const nodes = await SwcNode.findAll({
            where: {swcTracingId: id},
            order: [["sampleNumber", "ASC"]],
            include: [{
                model: StructureIdentifier
            }]
        });

        if (nodes.length === 0) {
            debug(`no nodes for tracing or tracing does not exist`);
        } else {
            const encoded = new Buffer(swcHeader(tracing) + mapToSwc(nodes)).toString("base64");

            response = {
                id,
                contents: encoded
            };
        }
    }

    await res.json(response);
}

function swcHeader(tracing: SwcTracing) {
    return `# Generated from MouseLight internal SWC manager ${moment().toLocaleString()}.\n` +
        `# Internal tracing id ${tracing.id}\n` +
        `# Annotator ${tracing.annotator}\n` +
        `# Original filename ${tracing.filename}\n` +
        `# OFFSET ${tracing.offsetX} ${tracing.offsetY} ${tracing.offsetZ}\n`;
}

function mapToSwc(nodes: SwcNode[]): string {
    return nodes.reduce((prev, node) => {
        let sampleNumber = node.sampleNumber;
        let parentNumber = node.parentNumber;

        return prev + `${sampleNumber}\t${node.structureIdentifier.value}\t${node.x.toFixed(6)}\t${node.y.toFixed(6)}\t${node.z.toFixed(6)}\t${node.radius.toFixed(6)}\t${parentNumber}\n`;
    }, "");
}
