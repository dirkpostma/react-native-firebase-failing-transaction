import firestore from '@react-native-firebase/firestore';

const db = firestore();
let logText = '';

async function asyncWait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const getTimeStamp = () => {
  const d = new Date();
  const datestring =
    // ('0' + d.getDate()).slice(-2) +
    // '-' +
    // ('0' + (d.getMonth() + 1)).slice(-2) +
    // '-' +
    // d.getFullYear() +
    // ' ' +
    ('0' + d.getHours()).slice(-2) +
    ':' +
    ('0' + d.getMinutes()).slice(-2) +
    ':' +
    ('0' + d.getSeconds()).slice(-2) +
    ':' +
    ('000' + d.getMilliseconds()).slice(-3);
  return datestring;
};

const log = message => {
  // const time = new Date().toISOString;
  const time = getTimeStamp();
  logText = `${logText}\n${time} ${message}`;
};

const createMove = async (uid, matchId, turn, delay = 0) => {
  console.log('createMove', {uid, matchId, turn, delay});
  log(`createMove ${uid} turn: ${turn}`);
  const matchRef = db.collection('matches').doc(matchId);

  return db.runTransaction(async transaction => {
    log(`BEGIN transaction ${uid} turn: ${turn}`);
    // READ
    log(`READ BEGIN ${uid}`);
    const match = await transaction.get(matchRef);
    const matchData = match.data();
    log(`READ DONE ${uid} - turn: ${matchData.turn}`);

    // CHECK & PROCESS
    if (matchData.turn !== turn) {
      const message = `Sorry ${uid}! Another player was faster!`;
      log(`ABORT transaction ${uid} turn: ${turn}`);
      throw new Error(message);
    }
    const newTurn = matchData.turn || 0 + 1;
    const newScore = matchData[`score_${uid}`] || 0 + 1;

    // WRITE
    const updateObject = {
      turn: newTurn,
    };
    const scoreField = `score_${uid}`;
    updateObject[scoreField] = newScore;
    console.log('WRITE', {uid, updateObject});
    log(
      `WRITE ${uid} - turn: ${updateObject.turn} ${scoreField}: ${
        updateObject[scoreField]
      }`,
    );

    await asyncWait(delay);

    // THIS UPDATE SHOULD BE ROLLED BACK
    // when the updateFunction is aborted second attempt
    await transaction.update(matchRef, updateObject);
    log(`END transaction ${uid}`);
  });
};

export const testTransaction = async () => {
  // Prepare
  const matchId = 'match_1';
  const matchRef = db.collection('matches').doc('match_1');
  await matchRef.set({
    turn: 0,
    score_user_1: 0,
    score_user_2: 0,
  });

  // Simulate two players trying to perform a turn
  // With different simulated roundtrip delays
  const promises = [
    createMove('user_1', matchId, 0, 100),
    createMove('user_2', matchId, 0, 20),
  ];

  try {
    await Promise.all(promises);
  } catch (e) {
    console.warn('catch: ', e);
  }

  await asyncWait(500);
  const newMatch = await matchRef.get();
  log(`RESULT ${JSON.stringify(newMatch.data())}`);
  console.log(logText);
};
