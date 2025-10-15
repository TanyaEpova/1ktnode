const zmq = require('zeromq');

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Использование: node game-client <min> <max>');
    process.exit(1);
  }

  const min = parseInt(args[0], 10);
  const max = parseInt(args[1], 10);

  if (isNaN(min) || isNaN(max) || min >= max) {
    console.error('Некорректный диапазон. Убедитесь, что min < max.');
    process.exit(1);
  }

 
  const secret = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`Загадано число: ${secret} (диапазон: ${min}-${max})`);

  const sock = new zmq.Request();
  await sock.connect('tcp://127.0.0.1:5555');

 
  await sock.send(JSON.stringify({ range: `${min}-${max}` }));

  let attempts = 0;
  while (true) {
    const [msg] = await sock.receive();
    const response = JSON.parse(msg.toString());
    const guess = response.answer;
    attempts++;

    console.log(`Попытка ${attempts}: сервер предположил ${guess}`);

    let hint;
    if (guess < secret) {
      hint = 'more';
    } else if (guess > secret) {
      hint = 'less';
    } else {
      hint = 'correct';
      console.log('✅ Сервер угадал число!');
      await sock.send(JSON.stringify({ hint }));
      break;
    }

    await sock.send(JSON.stringify({ hint }));
  }

  await sock.close();
}

main().catch(console.error);
