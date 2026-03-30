import { AddStrategy } from './strategies/AddStrategy.js';
import { SubtractStrategy } from './strategies/SubtractStrategy.js';
import { MultiplyStrategy } from './strategies/MultiplyStrategy.js';
import { DivideStrategy } from './strategies/DivideStrategy.js';
import { AndStrategy } from './strategies/AndStrategy.js';
import { OrStrategy } from './strategies/OrStrategy.js';
import { XorStrategy } from './strategies/XorStrategy.js';

export const BinaryRegistry = {
    add: { name: 'Suma', strategy: new AddStrategy() },
    sub: { name: 'Resta', strategy: new SubtractStrategy() },
    mul: { name: 'Multiplicación', strategy: new MultiplyStrategy() },
    div: { name: 'División', strategy: new DivideStrategy() },
    and: { name: 'AND (bit a bit)', strategy: new AndStrategy() },
    or: { name: 'OR (bit a bit)', strategy: new OrStrategy() },
    xor: { name: 'XOR (bit a bit)', strategy: new XorStrategy() },
};
