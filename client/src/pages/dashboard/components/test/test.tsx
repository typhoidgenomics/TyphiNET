import React from 'react';

import styles from './test.scss';

export interface testProps {
  prop?: string;
}

export function test({prop = 'default value'}: testProps) {
  return <div className={styles.test}>test {prop}</div>;
}
