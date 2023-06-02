// Helper for map color

export const samplesColorScale = (domain) => {
  if (domain >= 1 && domain <= 9) {
    return '#4575B4';
  } else if (domain >= 10 && domain <= 19) {
    return '#91BFDB';
  } else if (domain >= 20 && domain <= 99) {
    return '#ADDD8E';
  } else if (domain >= 100 && domain <= 299) {
    return '#FEE090';
  } else if (domain >= 300) {
    return '#FC8D59';
  }
};

export const redColorScale = (percentage) => {
  const p = parseInt(percentage);
  if (p >= 51) {
    return '#A20F17';
  } else if (p >= 11) {
    return '#DD2C24';
  } else if (p >= 3) {
    return '#FA694A';
  } else {
    return '#FAAD8F';
  }
};

export const sensitiveColorScale = (percentage) => {
  const p = parseFloat(percentage);
  if (p > 90) {
    return '#727272';
  } else if (p > 50) {
    return '#FAAD8F';
  } else if (p > 20) {
    return '#FA694A';
  } else if (p > 10) {
    return '#DD2C24';
  }
  return '#A20F17';
};
