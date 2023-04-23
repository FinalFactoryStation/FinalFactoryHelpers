import { drawBoxes, } from "./main.js";
import { readItems, readData } from "./items.js";
import { decode } from "./util.js";
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { polyfillPath2D } from "path2d-polyfill";
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { uploadBlueprint } from './azure-helper.cjs';

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

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

    const img = new AttachmentBuilder(canvas.toBuffer())
        .setName("image.png");

    const link = await uploadBlueprint(blueprintString);

    console.log(link);

    const response = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Some blueprint')
        .setImage('attachment://image.png')
        // .addFields({ name: 'view blueprint', value: link })



    // const shortApiCall = `https://cutt.ly/api/api.php?key=${CUTTLY_KEY}&short=${encodeURIComponent("https://jmerkow.github.io/FinalFactoryHelpers/bp-image.html?bp="+encodeURIComponent(blueprintString))}&noTitle=1`
    // console.log(shortApiCall);
    // const link = await fetch(shortApiCall)
    //     .then(response => response.json())
    //     .then(j => {
    //         console.log(j);
    //         return j.url.shortLink;
    //     });

    const button = new ButtonBuilder()
        .setLabel('view blueprint')
        .setURL(link)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder()
        .addComponents(button);

    await interaction.reply({ embeds: [response], files: [img], components: [row] });
}


const command = new SlashCommandBuilder()
    .setName('bp')
    .setDescription('Render blueprint string')
    .addStringOption(option => option.setName("blueprint_string").setDescription("blueprint to render").setRequired(true));

export { command, handler }