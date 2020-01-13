const TETRONIMOES = [
    {
        color: 1,
        forms: [
            [
                [1,1],
                [1,1]
            ],
            [
                [1,1],
                [1,1]
            ]
        ]
    },
    {
        color: 2,
        forms: [
            [
                [1,1,1,1],
            ],
            [
                [1],
                [1],
                [1],
                [1]
            ],
        ]
    },
    {
        color: 3,
        forms: [
            [
                [1,1,1],
                [0,0,1]
            ],
            [
                [0,1],
                [0,1],
                [1,1],
            ],
            [
                [1,0,0],
                [1,1,1],
            ],
            [
                [1,1],
                [1,0],
                [1,0],
            ]
        ]
    },
    {
        color: 4,
        forms: [
            [
                [1,1,1],
                [1,0,0]
            ],
            [
                [1,1],
                [0,1],
                [0,1],
            ],
            [
                [0,0,1],
                [1,1,1],
            ],
            [
                [1,0],
                [1,0],
                [1,1],
            ]
        ]
    },
    {
        color: 5,
        forms: [
            [
                [0,1,1],
                [1,1,0]
            ],
            [
                [1,0],
                [1,1],
                [0,1],
            ],
            [
                [0,1,1],
                [1,1,0],
            ],
            [
                [1,0],
                [1,1],
                [0,1],
            ]
        ]
    },
    {
        color: 6,
        forms: [
            [
                [1,1,1],
                [0,1,0]
            ],
            [
                [0,1],
                [1,1],
                [0,1],
            ],
            [
                [0,1,0],
                [1,1,1],
            ],
            [
                [1,0],
                [1,1],
                [1,0],
            ]
        ]
    },
    {
        color: 7,
        forms: [
            [
                [1,1,0],
                [0,1,1]
            ],
            [
                [0,1],
                [1,1],
                [1,0],
            ],
            [
                [1,1,0],
                [0,1,1],
            ],
            [
                [0,1],
                [1,1],
                [1,0],
            ]
        ]
    },
]
const colorFactory = id =>{
    switch(id){
        case 1:
            return "yellow";
        case 2:
            return "lightblue";
        case 3:
            return "orange";
        case 4:
            return "blue";
        case 5:
            return "red";
        case 6:
            return "purple";
        case 7:
            return "green"
    }
}