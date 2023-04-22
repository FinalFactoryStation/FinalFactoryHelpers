import { drawBoxes, readItems, readData } from "./main.js";
import { decode } from "./util.js";
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { polyfillPath2D } from "path2d-polyfill";

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';

const handler = async interaction => {
    const blueprintString = interaction.options.getString('blueprint_string');
    if (!blueprintString) {
        await interaction.reply({ content: 'you must supply a blueprint string', ephemeral: true });
    }

    const canvas = createCanvas(500,500);
    const blueprint = decode(blueprintString);
    const items = readItems(blueprint);
    const itemData = await readData("itemData.json")
    await drawBoxes(canvas, items, itemData);

    console.log('<img src="' + canvas.toDataURL() + '" />')
    const img = new AttachmentBuilder(canvas.toBuffer())
        .setName("image.png");
        
    const response = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Some blueprint')
        .setImage('attachment://image.png')

    await interaction.reply({ embeds: [response], files: [img] });
}


const command = new SlashCommandBuilder()
    .setName('bp')
    .setDescription('Render blueprint string')
    .addStringOption(option => option.setName("blueprint_string").setDescription("blueprint to render").setRequired(true));

export { command, handler }