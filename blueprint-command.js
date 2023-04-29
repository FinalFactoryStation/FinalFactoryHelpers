import { BlueprintView } from "./blueprint-view.js";
import { Blueprint } from "./blueprint.js";
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { polyfillPath2D } from "path2d-polyfill";
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { uploadBlueprint, createHash } from './azure-helper.cjs';
import { styles, TRANSFORMATIONS } from "./constants.js";

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

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

const ROTATE_CLOCKWISE = "bp.rc";
const ROTATE_COUNTER = "bp.rcc";
const FLIP_HORIZONTAL = "bp.fh";
const FLIP_VERTICAL = "bp.fv";

const buttonIds = [ROTATE_CLOCKWISE, ROTATE_COUNTER, FLIP_HORIZONTAL, FLIP_VERTICAL]

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

/* ButtonInteraction {
  type: 3,
  id: '1101723326721839126',
  applicationId: '1099311743542509610',
  channelId: '1093270294476628060',
  guildId: '530867164866150410',
  user: User {
    id: '219206788162125845',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 0 },
    username: 'Bull',
    discriminator: '5481',
    avatar: '7ee07999d5e5274584b42b1228626ab4',
    banner: undefined,
    accentColor: undefined
  },
  member: GuildMember {
    guild: Guild {
      id: '530867164866150410',
      name: 'Final Factory',
      icon: 'ecaa070daeafdaa31a6148fc648957fe',
      features: [Array],
      commands: [GuildApplicationCommandManager],
      members: [GuildMemberManager],
      channels: [GuildChannelManager],
      bans: [GuildBanManager],
      roles: [RoleManager],
      presences: PresenceManager {},
      voiceStates: [VoiceStateManager],
      stageInstances: [StageInstanceManager],
      invites: [GuildInviteManager],
      scheduledEvents: [GuildScheduledEventManager],
      autoModerationRules: [AutoModerationRuleManager],
      available: true,
      shardId: 0,
      splash: '7c991d72eef4272044702428ae15142a',
      banner: '8266f3941eb337c8d7c48d4ace8252dd',
      description: 'A community for the indie automation game, Final Factory.',
      verificationLevel: 1,
      vanityURLCode: 'finalfactory',
      nsfwLevel: 0,
      premiumSubscriptionCount: 15,
      discoverySplash: null,
      memberCount: 539,
      large: true,
      premiumProgressBarEnabled: true,
      applicationId: null,
      afkTimeout: 900,
      afkChannelId: '530955592857288715',
      systemChannelId: '1038540829184241674',
      premiumTier: 3,
      widgetEnabled: null,
      widgetChannelId: null,
      explicitContentFilter: 2,
      mfaLevel: 1,
      joinedTimestamp: 1682167037581,
      defaultMessageNotifications: 1,
      systemChannelFlags: [SystemChannelFlagsBitField],
      maximumMembers: 250000,
      maximumPresences: null,
      maxVideoChannelUsers: 25,
      maxStageVideoChannelUsers: 300,
      approximateMemberCount: null,
      approximatePresenceCount: null,
      vanityURLUses: null,
      rulesChannelId: '1038523082874298479',
      publicUpdatesChannelId: '1038523314177581138',
      preferredLocale: 'en-US',
      ownerId: '226422780445458432',
      emojis: [GuildEmojiManager],
      stickers: [GuildStickerManager]
    },
    joinedTimestamp: 1677433019603,
    premiumSinceTimestamp: 1677791839245,
    nickname: null,
    pending: false,
    communicationDisabledUntilTimestamp: null,
    _roles: [
      '1070112448041988209',
      '1042564699956461620',
      '1069781945556402206',
      '1087499933021634631'
    ],
    user: User {
      id: '219206788162125845',
      bot: false,
      system: false,
      flags: [UserFlagsBitField],
      username: 'Bull',
      discriminator: '5481',
      avatar: '7ee07999d5e5274584b42b1228626ab4',
      banner: undefined,
      accentColor: undefined
    },
    avatar: null,
    flags: GuildMemberFlagsBitField { bitfield: 0 }
  },
  version: 1,
  appPermissions: PermissionsBitField { bitfield: 137411140378177n },
  memberPermissions: PermissionsBitField { bitfield: 138538465099767n },
  locale: 'en-US',
  guildLocale: 'en-US',
  message: <ref *1> Message {
    channelId: '1093270294476628060',
    guildId: '530867164866150410',
    id: '1101723315405602990',
    createdTimestamp: 1682741707422,
    type: 20,
    system: false,
    content: '',
    author: ClientUser {
      id: '1099311743542509610',
      bot: true,
      system: false,
      flags: [UserFlagsBitField],
      username: 'FinalFactoryHelper',
      discriminator: '7136',
      avatar: null,
      banner: undefined,
      accentColor: undefined,
      verified: true,
      mfaEnabled: true
    },
    pinned: false,
    tts: false,
    nonce: null,
    embeds: [ [Embed] ],
    components: [ [ActionRow] ],
    attachments: Collection(1) [Map] { '1101723315837599765' => [Attachment] },
    stickers: Collection(0) [Map] {},
    position: 1351,
    roleSubscriptionData: null,
    editedTimestamp: null,
    reactions: ReactionManager { message: [Circular *1] },
    mentions: MessageMentions {
      everyone: false,
      users: Collection(0) [Map] {},
      roles: Collection(0) [Map] {},
      _members: null,
      _channels: null,
      _parsedUsers: null,
      crosspostedChannels: Collection(0) [Map] {},
      repliedUser: null
    },
    webhookId: '1099311743542509610',
    groupActivityApplication: null,
    applicationId: '1099311743542509610',
    activity: null,
    flags: MessageFlagsBitField { bitfield: 0 },
    reference: null,
    interaction: {
      id: '1101723312440229971',
      type: 2,
      commandName: 'bp',
      user: [User]
    }
  },
  customId: 'rotate_clockwise',
  componentType: 2,
  deferred: false,
  ephemeral: null,
  replied: false,
  webhook: InteractionWebhook { id: '1099311743542509610' }
}
*/