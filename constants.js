// const BACKGROUND_DEFAULT = "black";
// const BACKGROUND_HIGHLIGHT = "#414a4c";
// const CANVAS_BACKGROUND = "grey";
// const NO_CONNECT_BACKGROUND = "red"
// const CONNECT_BACKGROUND = "midnightblue"

// const STROKE_HIGHLIGHT = "green";
// const WIDTH_STROKE = .03;
// const STOKE_DEFAULT = "black";

const styles = {
    DEFAULT_ITEM: {
        background: "black",
        stroke: "black",
        stroke_width: 0.03
    },
    HIGHLIGHT_STATION: {
        background: "#414a4c",
        stroke: "green",
        stroke_width: 0.03
    },
    HIGHLIGHT_ITEM: {
        background: "#414a4c",
        stroke: "green",
        stroke_width: 0.03
    }
}

const dir = {
    UP: 0b1,
    RIGHT: 0b10,
    DOWN: 0b100,
    LEFT: 0b1000,
    
    ANY: 0b1111, // UP + RIGHT + DOWN + LEFT
    HORIZONTAL: 0b1010, // RIGHT + LEFT
    VERTICAL: 0b0101 // UP + DOWN
}

const sources = {
    ITEMS_DATA_URL: "itemData.json",
    OVERRIDES_URL: "overrides-itemData.json",
}

// const UNCONNECT_SIZE = 0.04;
// const MARGIN_ITEM = UNCONNECT_SIZE + WIDTH_STROKE - 0.02;

// const HIGHLIGHTED = 1;

export { styles, dir, sources }