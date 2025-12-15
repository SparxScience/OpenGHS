let ITEMS = [
    {
        name: "Crazy Bird",
        description: "A crazy bird will help you. It doesn't really comprehend what a spacebar is, so it will peck at the entire keyboard until it manages to strike the spacebar, which happens once every <b>%v seconds</b>.",
        cost: 30,
        initial_value: .2,
        lvl: 0,
        cost_func: (x) => 1.1 * x,
        value_func: (x) => x,
        getDescription: (it) => it.description.replace("%v", 1.0 / it.initial_value),
    },
    {
        name: "Millennials",
        description: "A low-key Gen Y will help you press the spacebar. It's a bit slow, but they can hit it <b>%vx a second</b>!",
        cost: 120,
        initial_value: 3,
        lvl: 0,
        cost_func: (x) => 1.3 * x,
        value_func: (x) => 1.0 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Zoomers",
        description: "A Gen Z kid can help you press the keyboard. Despite being unfamiliar with keyboards, they possess great proficiency in rapidly scrolling through short vertical videos online, <b>%vx a second</b>!",
        cost: 500,
        initial_value: 20,
        lvl: 0,
        cost_func: (x) => 1.4 * x,
        value_func: (x) => 1.0 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Keyboard Upgrade",
        description: "Every upgrade will <b>DOUBLE</b> your own hits.",
        cost: 6000,
        multiplier: 2,
        lvl: 0,
        cost_func: (x) => 3.5 * x,
        getDescription: (it) => it.description,
    },
    {
        name: "Angry Influencer",
        description: "Angry influencer whose computer crashed and they're now bashing their heads against the keyboard. The more influencer you get, the faster they can hit it, because they can't stand competition. The next one will give <b>%vx per second</b>.",
        cost: 10000,
        initial_value: 150,
        lvl: 0,
        cost_func: (x) => 1.5 * x,
        value_func: (x) => 1.2 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "MOBA Gamer",
        description: "MOBA gamers are fast at pressing keys and they play well in teams. New gamer will hit it <b>%vx per second</b>.",
        cost: 200000,
        initial_value: 600,
        lvl: 0,
        cost_func: (x) => 1.4 * x,
        value_func: (x) => 1.25 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Homemade Pressing Robot",
        description: "Just a simple robot made out of a broken robot vacuum cleaner that can press the key at the impressive rate of <b>%vx per second</b>!",
        cost: 800000,
        initial_value: 3500,
        lvl: 0,
        cost_func: (x) => 1.4 * x,
        value_func: (x) => 1.25 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Laser Machine",
        description: "A laser machine that fires continuous laser beams at the spacebar, at a rate of <b>%vx per second</b>!",
        cost: 2000000,
        initial_value: 25000,
        lvl: 0,
        cost_func: (x) => 1.4 * x,
        value_func: (x) => 1.3 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Nuclear Energy Device",
        description: "A powerful device harnessing nuclear energy to strike the spacebar at an incredible rate of <b>%vx per second</b>!",
        cost: 10000000,
        initial_value: 100000,
        lvl: 0,
        cost_func: (x) => 1.4 * x,
        value_func: (x) => 1.3 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Alien Tech Key Pressing Machine",
        description: "An alien technology-powered machine that presses the key at an unimaginable rate of <b>%vx per second</b>!",
        cost: 80000000,
        initial_value: 1000000,
        lvl: 0,
        cost_func: (x) => 1.4 * x,
        value_func: (x) => 1.3 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Super Computer",
        description: "A supercomputer designed to press the spacebar at lightning speed, hitting it at <b>%vx per second</b>!",
        cost: 200000000,
        initial_value: 5000000,
        lvl: 0,
        cost_func: (x) => 1.5 * x,
        value_func: (x) => 1.35 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Quantum Press",
        description: "Using quantum computing, this device strikes the spacebar in parallel universes at a rate of <b>%vx per second</b>!",
        cost: 1000000000,
        initial_value: 25000000,
        lvl: 0,
        cost_func: (x) => 1.6 * x,
        value_func: (x) => 1.4 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "AI Assistant",
        description: "An AI assistant that predicts when to press the spacebar and does so with <b>%vx per second</b> efficiency!",
        cost: 5000000000,
        initial_value: 100000000,
        lvl: 0,
        cost_func: (x) => 1.7 * x,
        value_func: (x) => 1.45 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Robot Army",
        description: "A synchronized army of robots, all programmed to hit the spacebar at a combined rate of <b>%vx per second</b>!",
        cost: 20000000000,
        initial_value: 500000000,
        lvl: 0,
        cost_func: (x) => 1.8 * x,
        value_func: (x) => 1.5 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Dimensional Rift",
        description: "A rift in dimensions that multiplies the pressing speed of the spacebar by creating duplicates of it in other realities at a rate of <b>%vx per second</b>!",
        cost: 100000000000,
        initial_value: 1000000000,
        lvl: 0,
        cost_func: (x) => 1.9 * x,
        value_func: (x) => 1.55 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Hyperdrive Press",
        description: "A hyperdrive machine that accelerates the spacebar pressing speed to warp speeds, hitting <b>%vx per second</b>!",
        cost: 500000000000,
        initial_value: 5000000000,
        lvl: 0,
        cost_func: (x) => 2.0 * x,
        value_func: (x) => 1.6 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Cosmic Entity",
        description: "A cosmic entity from beyond time and space that taps the spacebar at an astronomical rate of <b>%vx per second</b>!",
        cost: 1000000000000,
        initial_value: 10000000000,
        lvl: 0,
        cost_func: (x) => 2.1 * x,
        value_func: (x) => 1.65 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Time Manipulator",
        description: "A device that manipulates time itself, allowing it to press the spacebar infinitely fast at <b>%vx per second</b>!",
        cost: 5000000000000,
        initial_value: 50000000000,
        lvl: 0,
        cost_func: (x) => 2.2 * x,
        value_func: (x) => 1.7 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Universal Anomaly",
        description: "An anomaly in the universe that causes the spacebar to be pressed across all dimensions at <b>%vx per second</b>!",
        cost: 10000000000000,
        initial_value: 100000000000,
        lvl: 0,
        cost_func: (x) => 2.3 * x,
        value_func: (x) => 1.75 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
    {
        name: "Singularity",
        description: "The ultimate machine, a singularity that absorbs all matter and energy, using it to press the spacebar at <b>%vx per second</b>!",
        cost: 50000000000000,
        initial_value: 500000000000,
        lvl: 0,
        cost_func: (x) => 2.4 * x,
        value_func: (x) => 1.8 * x,
        getDescription: (it) => it.description.replace("%v", nfmt(it.value)),
    },
];

(function() {
    for (let i in ITEMS) {
        ITEMS[i].value = ITEMS[i].initial_value;
    }
})();

let total_item_value = (item) => {
    let c = 0;
    let v = item.initial_value;

    for (let i = 0; i < item.lvl; i++) {
        c += v;
        v = item.value_func(v);
    }

    return c;
}

let LEVELS = [
    {
        psvalue: 0,
        rain: 0,
    },
    {
        psvalue: 10,
        rain: 5,
    },
    {
        psvalue: 100,
        rain: 10,
    },
    {
        psvalue: 500,
        rain: 12,
    },
    {
        psvalue: 1000,
        rain: 15,
    },
    {
        psvalue: 5000,
        rain: 17,
    },
    {
        psvalue: 10000,
        rain: 18,
    },
    {
        psvalue: 50000,
        rain: 19,
    },
    {
        psvalue: 100000,
        rain: 20,
    },
    {
        psvalue: 300000,
        rain: 21,
    },
    {
        psvalue: 800000,
        rain: 22,
    },
    {
        psvalue: 1000000,
        rain: 23,
    },
];

const SOUNDS = {
    click: [
        jsfxr([0,0,0.07086974935991196,0.45065582613048494,0.12451125371771453,0.6610070860477287,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0.5]),
        jsfxr([0,0,0.07086974935991196,0.35,0.12451125371771453,0.7,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0.5]),
        jsfxr([0,0,0.1,0.35,0.12451125371771453,0.65,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0.5]),
    ],
    buy: [
        jsfxr([3,0,0.2914228463087029,0.39443991332966943,0.47848602130372286,0.08144714074126518,0,0.24222569085835757,0,0,0,-0.6369038513918057,0.7915717139323191,0,0,0,0,0,1,0,0,0,0,0.5]),
        jsfxr([3,0,0.2914228463087029,0.39443991332966943,0.55,0.15,0,0.24222569085835757,0,0,0,-0.6369038513918057,0.7915717139323191,0,0,0,0,0,1,0,0,0,0,0.5]),
        jsfxr([3,0,0.25,0.39443991332966943,0.45,0.25,0,0.24222569085835757,0,0,0,-0.6369038513918057,0.7915717139323191,0,0,0,0,0,1,0,0,0,0,0.5]),
    ],
};
