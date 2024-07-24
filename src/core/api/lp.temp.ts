type PrintOptions = {
    printer?: string;
    copies?: number;
    collate?: boolean;
    media?: string;
    orientation?: 'portrait' | 'landscape' | 'reverse_landscape' | 'reverse_portrait';
    sides?: 'one-sided' | 'two-sided-short-edge' | 'two-sided-long-edge';
    jobSheets?: 'none' | 'standard' | 'classified' | 'confidential' | 'secret' | 'topsecret' | 'unclassified';
    holdUntil?: 'indefinite' | 'day-time' | 'night' | 'second-shift' | 'third-shift' | 'weekend' | string;
    jobPriority?: number;
    outputOrder?: 'normal' | 'reverse';
    pageRanges?: string;
    numberUp?: 1 | 2 | 4 | 6 | 9 | 16;
    pageBorder?: 'double' | 'double-thick' | 'none' | 'single' | 'single-thick';
    numberUpLayout?: 'btlr' | 'btrl' | 'lrbt' | 'lrtb' | 'rlbt' | 'rltb' | 'tblr' | 'tbrl';
    fitToPage?: boolean;
    mirror?: boolean;
    raw?: boolean;
};

function generatePrintCommand(filename: string, options: PrintOptions): string {
    const lpOptions: string[] = [];

    if (options.printer) {
        lpOptions.push(`-d ${options.printer}`);
    }
    if (options.copies) {
        lpOptions.push(`-n ${options.copies}`);
    }
    if (options.collate) {
        lpOptions.push(`-o collate=true`);
    }
    if (options.media) {
        lpOptions.push(`-o media=${options.media}`);
    }
    if (options.orientation) {
        const orientationMap = {
            'portrait': '3',
            'landscape': '4',
            'reverse_landscape': '5',
            'reverse_portrait': '6'
        };
        lpOptions.push(`-o orientation-requested=${orientationMap[options.orientation]}`);
    }
    if (options.sides) {
        lpOptions.push(`-o sides=${options.sides}`);
    }
    if (options.jobSheets) {
        lpOptions.push(`-o job-sheets=${options.jobSheets}`);
    }
    if (options.holdUntil) {
        lpOptions.push(`-o job-hold-until=${options.holdUntil}`);
    }
    if (options.jobPriority !== undefined) {
        lpOptions.push(`-o job-priority=${options.jobPriority}`);
    }
    if (options.outputOrder) {
        lpOptions.push(`-o outputorder=${options.outputOrder}`);
    }
    if (options.pageRanges) {
        lpOptions.push(`-o page-ranges=${options.pageRanges}`);
    }
    if (options.numberUp) {
        lpOptions.push(`-o number-up=${options.numberUp}`);
    }
    if (options.pageBorder) {
        lpOptions.push(`-o page-border=${options.pageBorder}`);
    }
    if (options.numberUpLayout) {
        lpOptions.push(`-o number-up-layout=${options.numberUpLayout}`);
    }
    if (options.fitToPage) {
        lpOptions.push(`-o fit-to-page`);
    }
    if (options.mirror) {
        lpOptions.push(`-o mirror`);
    }
    if (options.raw) {
        lpOptions.push(`-o raw`);
    }

    const command = `lp ${lpOptions.join(' ')} ${filename}`;
    return command;
}

// Example usage:
const options: PrintOptions = {
    printer: 'Printer1',
    copies: 2,
    collate: true,
    media: 'A4',
    orientation: 'landscape',
    sides: 'two-sided-long-edge',
    jobSheets: 'standard',
    jobPriority: 50,
    outputOrder: 'normal',
    pageRanges: '1-4,7,9-12',
    numberUp: 4,
    pageBorder: 'single',
    fitToPage: true
};

const command = generatePrintCommand('example.pdf', options);
console.log(command);