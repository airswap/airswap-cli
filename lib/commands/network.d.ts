import { Command } from '@oclif/command';
export default class Network extends Command {
    static description: string;
    run(): Promise<void>;
}
