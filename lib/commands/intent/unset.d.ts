import { Command } from '@oclif/command';
export default class IntentUnset extends Command {
    static description: string;
    run(): Promise<void>;
}
