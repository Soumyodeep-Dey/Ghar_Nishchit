let shuttingDown = false;

export const isShuttingDown = () => shuttingDown;
export const markShuttingDown = () => {
  shuttingDown = true;
};

