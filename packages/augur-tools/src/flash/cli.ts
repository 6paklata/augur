import { FlashSession } from './flash';
import Vorpal from 'vorpal';
import program from "commander";
import { addScripts } from './scripts';
import { addGanacheScripts } from './ganache-scripts';
import { Account, ACCOUNTS } from '../constants';
import { ArgumentParser, RawDescriptionHelpFormatter} from 'argparse';
import { NetworkConfiguration, NETWORKS } from '@augurproject/core';
import { Addresses } from '@augurproject/artifacts';
import { computeAddress } from 'ethers/utils';

async function run(flash: FlashSession) {
  program
    .name('flash')
    .option('-n, --network', `Name of network to run on. Use "none" for commands that don't use a network.)`, 'environment');
  program
    .command('interactive')
    .description('Run flash interactively, where you can connect once and run multiple flash scripts in the same session.')
    .action(() => {
      const vorpal = makeVorpalCLI(flash);
      flash.log = vorpal.log.bind(vorpal);
      vorpal.show();
    })

  for (const name of Object.keys(flash.scripts) || []) {
    const script = flash.scripts[name];
    const subcommand = program.command(script.name).description(script.description);

    for (const opt of script.options || []) {
      const args = [ `--${opt.name}`];
      if (opt.abbr) args.unshift(`-${opt.abbr}`);
      const option = opt.required ? subcommand.requiredOption(args.join(', ')) : subcommand.option(args.join(', '))
        .description(opt.description || '')
    }
    subcommand.action(async (args) => {
      try {
        if (args.network !== 'none') {
          flash.network = NetworkConfiguration.create(args.network as NETWORKS);
          flash.provider = flash.makeProvider(flash.network);
          const networkId = await flash.getNetworkId(flash.provider);
          flash.contractAddresses = Addresses[networkId];
        }
        await flash.call(script.name, args);
      } catch(e){
        console.error(e);
        process.exit(1); // Needed to prevent hanging
      } finally {
        process.exit(0); // Needed to prevent hanging
      }
    });
  }

  if (process.argv.length === 2) {
    program.help();
  } else {
    await program.parseAsync(process.argv);
  }
}

function makeVorpalCLI(flash: FlashSession): Vorpal {
  const vorpal = new Vorpal();

  for (const script of Object.values(flash.scripts)) {
    let v: Vorpal|Vorpal.Command = vorpal;
    v = v.command(script.name, script.description || '');

    const types = { string: [], boolean: [] };
    for (const option of script.options || []) {
      // Vorpal interprets options as boolean (flag) or string,
      // depending on the structure of its first argument.
      //   boolean: --foo
      //   string: --foo <bar>
      const flag = option.flag || false;
      const abbr = option.abbr ? `-${option.abbr},` : '';
      const optionValue = `${abbr}--${option.name}${flag ? '' : ' <arg>'}`;
      v = v.option(optionValue, option.description);
      if (flag) {
        types.boolean.push(option.name);
        if (option.abbr) types.boolean.push(option.abbr);
      } else {
        types.string.push(option.name);
        if (option.abbr) types.string.push(option.abbr);
      }
    }
    v.types(types);
    v = v.action(async function(this: Vorpal.CommandInstance, args: Vorpal.Args): Promise<void> {
      await flash.call(script.name, args.options).catch(console.error);
    });
  }

  vorpal.delimiter('augur$');

  return vorpal;
}

if (require.main === module) {
  (async () => {
    let accounts: Account[];
    if (process.env.ETHEREUM_PRIVATE_KEY) {
      let key = process.env.ETHEREUM_PRIVATE_KEY;
      if (key.slice(0, 2) !== '0x') {
        key = `0x${key}`;
      }

      accounts = [
        {
          secretKey: key,
          publicKey: computeAddress(key),
          balance: 0,
        },
      ];
    } else {
      accounts = ACCOUNTS;
    }

    const flash = new FlashSession(accounts);

    addScripts(flash);
    addGanacheScripts(flash);

    await run(flash);
  })();
}
