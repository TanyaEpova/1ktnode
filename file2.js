const zmq = require('zeromq');

async function main() {
  const sock = new zmq.Reply();

 
  await sock.bind('tcp://127.0.0.1:5555');
  console.log('Готов к игре...');

  while (true) {
    try {
      
      const [msg] = await sock.receive();
      const request = JSON.parse(msg.toString());

      if (request.range) {
      
        const [minStr, maxStr] = request.range.split('-');
        let min = parseInt(minStr, 10);
        let max = parseInt(maxStr, 10);

        console.log(`Получен диапазон: ${min}-${max}`);

      
        let guess = Math.floor((min + max) / 2);
        console.log(`Предполагаю: ${guess}`);
        await sock.send(JSON.stringify({ answer: guess }));

       
        while (true) {
          const [hintMsg] = await sock.receive();
          const hint = JSON.parse(hintMsg.toString());

          console.log(`Подсказка от клиента: ${hint.hint}`);

          if (hint.hint === 'more') {
            min = guess + 1;
          } else if (hint.hint === 'less') {
            max = guess - 1;
          } else if (hint.hint === 'correct') {
            console.log('Число угадано!');
            break;
          }

          guess = Math.floor((min + max) / 2);
          console.log(`Предполагаю: ${guess}`);
          await sock.send(JSON.stringify({ answer: guess }));
        }
      }
    } catch (err) {
      console.error('Ошибка сервера:', err);
      break;
    }
  }

  await sock.close();
}

main().catch(console.error);
