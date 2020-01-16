import { Command } from '@oclif/command';
export default class Local extends Command {
    static description: string;
    run(): Promise<void>;
}
