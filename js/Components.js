import { TagComponent, Component, Types } from 'ecsy';
import { Vector3 } from 'three';

class Moving extends Component {}
Moving.schema = {
    direction: { type: Types.Ref, default: new Vector3() },
    velocity: { type: Types.Number, default: 1 },
    acceleration: { type: Types.Number, default: 0 },
    boundries: { type: Types.Ref },
    respawnRange: { type: Types.Number }
};

class ControllableBasket extends Component {}
ControllableBasket.schema = {
    speed: { type: Types.Number },
    input: { type: Types.Ref },
    boundries: { type: Types.Ref },
    score: { type: Types.Number },
    lives: { type: Types.Number }
};

class Egg extends Component {}
Egg.schema = {
    points: { type: Types.Number }
};

class Hearts extends TagComponent {}

export { Moving, ControllableBasket, Egg, Hearts };