import { BlueprintView } from "./blueprint-view.js";
import { Blueprint } from "./blueprint.js";
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { polyfillPath2D } from "path2d-polyfill";
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { uploadBlueprint, createHash } from './azure-helper.cjs';
import { styles, TRANSFORMATIONS } from "./constants.js";

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

const ROTATE_CLOCKWISE = "bp.rc";
const ROTATE_COUNTER = "bp.rcc";
const FLIP_HORIZONTAL = "bp.fh";
const FLIP_VERTICAL = "bp.fv";

const buttonIds = [ROTATE_CLOCKWISE, ROTATE_COUNTER, FLIP_HORIZONTAL, FLIP_VERTICAL]

const makeReply = async blueprintString => {
    const canvas = createCanvas(500,500);

    const blueprint = await BlueprintView.create(blueprintString, canvas);

    blueprint.styleConnections({
      fill: "midnightblue"
    })
    await blueprint.style(styles.DEFAULT_ITEM)

    const img = new AttachmentBuilder(canvas.toBuffer())
        .setName("image.png");
    const src = new AttachmentBuilder(Buffer.from(blueprintString, "utf-8"))
        .setName("bp.txt");

    const hash = createHash(blueprintString);

    const link = await uploadBlueprint(blueprint.serialize());

    const response = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Some blueprint')
        .setImage('attachment://image.png')

    const viewButton = new ButtonBuilder()
        .setLabel('view blueprint')
        .setURL(link)
        .setStyle(ButtonStyle.Link);

    const clockwiseButton = new ButtonBuilder()
        .setCustomId(ROTATE_CLOCKWISE)
        .setEmoji({name: "↩️"})
        .setStyle(ButtonStyle.Secondary);

    const counterButton = new ButtonBuilder()
        .setCustomId(ROTATE_COUNTER)
        .setEmoji({name: "↪"})
        .setStyle(ButtonStyle.Secondary);

    const hflipButton = new ButtonBuilder()
        .setCustomId(FLIP_HORIZONTAL)
        .setEmoji({name: "↔️"})
        .setStyle(ButtonStyle.Secondary);

    const vflipButton = new ButtonBuilder()
        .setCustomId(FLIP_VERTICAL)
        .setEmoji({name: "↕️"})
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(clockwiseButton, counterButton, hflipButton, vflipButton, viewButton);

    return { embeds: [response], files: [img], components: [row] };
}

const handler = async interaction => {
    const blueprintString = interaction.options.getString('blueprint_string');
    if (!blueprintString) {
        await interaction.reply({ content: 'you must supply a blueprint string', ephemeral: true });
    }

    await interaction.reply(await makeReply(blueprintString));
}

const getTransform = id => {
    switch(id) {
        case ROTATE_CLOCKWISE: return TRANSFORMATIONS.CLOCKWISE;
        case ROTATE_COUNTER: return TRANSFORMATIONS.COUNTER_CLOCKWISE;
        case FLIP_VERTICAL: return TRANSFORMATIONS.VFLIP;
        case FLIP_HORIZONTAL: return TRANSFORMATIONS.HFLIP;
    }
}

const buttonHandler = async interaction => {
    const url = interaction.message.components[0].components.find(c => c.url).url;
    const oldBlueprintString = decodeURIComponent((await fetch(url).then(response => response.text())).match(/bp=(.*)'/)[1]);
    const blueprintString = (await(await Blueprint.create(oldBlueprintString)).transform(getTransform(interaction.customId))).serialize();

    await interaction.update(await makeReply(blueprintString));
}

const command = new SlashCommandBuilder()
    .setName('bp')
    .setDescription('Render blueprint string')
    .addStringOption(option => option.setName("blueprint_string").setDescription("blueprint to render").setRequired(true));

export { command, handler, buttonIds, buttonHandler }
