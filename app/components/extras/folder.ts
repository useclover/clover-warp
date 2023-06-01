
export const getSize = (size: number) => {

    const format = (_size: number, subsize:number, type: string): string => {
        return (_size / subsize).toFixed(2) + type;
    }

    if(size > 1073741820000)
        return format(size, 1073741820000, 'Tb');
    else if (size > 1073741820) 
          return format(size, 1073741820, "Gb");
    else if(size > 1048576)
          return format(size, 1048576, 'Mb');
    else if(size > 1024)
          return format(size, 1024, 'Kb');
    else if (size > 0) 
          return format(size, 1, 'B');
  }



  