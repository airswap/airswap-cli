import { Command } from '@oclif/command';
export default class IP extends Command {
    static description: string;
    run(): Promise<void>;
}
