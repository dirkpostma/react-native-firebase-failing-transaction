import firestore from '@react-native-firebase/firestore';

const db = firestore();

async function asyncWait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const createMove = async (uid, matchId, turn, delay = 0) => {
  console.log('createMove', {uid, matchId, turn, delay});
  const matchRef = db.collection('matches').doc(matchId);

  return db.runTransaction(async transaction => {
    // READ
    const match = await transaction.get(matchRef);
    const matchData = match.data();
    console.log('READ', {uid, matchData});

    // CHECK & PROCESS
    if (matchData.turn !== turn) {
      const message = `Sorry ${uid}! Another player was faster!`;
      throw new Error(message);
    }
    const newTurn = turn + 1;
    const newScore = matchData[`score_${uid}`] || 0 + 1;

    // WRITE
    await asyncWait(delay);
    const updateObject = {
      turn: newTurn,
    };
    updateObject[`score_${uid}`] = newScore;
    console.log('WRITE', {uid, updateObject});
    transaction.update(matchRef, updateObject);
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
  alert(JSON.stringify(newMatch.data(), null, 2));
};
