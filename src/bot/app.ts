// メッセージが"おはクマ"だったら実行する処理
app.message(/^おは(クマ|くま)$/, async ({ say }) => {
  const bearInfo: BearInfo = JSON.parse(await getRandomItemInfo());
  console.log(bearInfo);
  let message: string = `今日のクマーは「${bearInfo.name}」です。`;
  if (bearInfo.info) {
    message += `\n${bearInfo.info}`;
  }
  if (bearInfo.imageUrl) {
    message += `\n${bearInfo.imageUrl}`;
  }
  await say(message);
});
