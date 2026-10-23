/**
 * IVR Telephony Simulation Service
 * Interactive phone tree simulator with bilingual prompts (English & Telugu),
 * DTMF keypad digit navigation, emergency safety routing, and speech synthesis strings.
 */

import APP_CONFIG from '@/config/app-config';
import { getDataStore } from '@/lib/repository/data-store';

export type IvrStep =
  | 'LANGUAGE_SELECT'
  | 'MAIN_MENU'
  | 'HOSPITALS_MENU'
  | 'HOSPITAL_DETAILS'
  | 'DEPARTMENTS_MENU'
  | 'EMERGENCY_INFO';

export interface IvrState {
  currentStep: IvrStep;
  language: 'en' | 'te';
  selectedHospitalId?: string;
  selectedDepartmentId?: string;
  history: string[];
}

export interface IvrMenuOption {
  key: string;
  label: string;
  actionDesc: string;
}

export interface IvrPromptResult {
  state: IvrState;
  promptText: string;
  spokenAudioText: string;
  availableOptions: IvrMenuOption[];
}

class IvrSimulationService {
  private static instance: IvrSimulationService;

  private constructor() {}

  public static getInstance(): IvrSimulationService {
    if (!IvrSimulationService.instance) {
      IvrSimulationService.instance = new IvrSimulationService();
    }
    return IvrSimulationService.instance;
  }

  public getInitialState(): IvrState {
    return {
      currentStep: 'LANGUAGE_SELECT',
      language: 'en',
      history: [],
    };
  }

  public async processInput(currentState: IvrState, digit: string): Promise<IvrPromptResult> {
    const state: IvrState = { ...currentState, history: [...currentState.history, digit] };
    const store = getDataStore();
    const hospitals = await store.getHospitals({ activeOnly: true });

    switch (state.currentStep) {
      case 'LANGUAGE_SELECT': {
        if (digit === '1') {
          state.language = 'en';
          state.currentStep = 'MAIN_MENU';
        } else if (digit === '2') {
          state.language = 'te';
          state.currentStep = 'MAIN_MENU';
        }
        return this.renderStep(state);
      }

      case 'MAIN_MENU': {
        if (digit === '1') {
          state.currentStep = 'HOSPITALS_MENU';
        } else if (digit === '2') {
          state.currentStep = 'DEPARTMENTS_MENU';
        } else if (digit === '3') {
          state.currentStep = 'EMERGENCY_INFO';
        } else if (digit === '9') {
          state.currentStep = 'LANGUAGE_SELECT';
        }
        return this.renderStep(state);
      }

      case 'HOSPITALS_MENU': {
        if (digit === '*') {
          state.currentStep = 'MAIN_MENU';
          return this.renderStep(state);
        }
        const index = parseInt(digit, 10) - 1;
        if (index >= 0 && index < hospitals.length) {
          state.selectedHospitalId = hospitals[index].id;
          state.currentStep = 'HOSPITAL_DETAILS';
        }
        return this.renderStep(state);
      }

      case 'HOSPITAL_DETAILS': {
        if (digit === '*') {
          state.currentStep = 'HOSPITALS_MENU';
        } else if (digit === '#') {
          state.currentStep = 'MAIN_MENU';
        }
        return this.renderStep(state);
      }

      case 'DEPARTMENTS_MENU': {
        if (digit === '*') {
          state.currentStep = 'MAIN_MENU';
        }
        return this.renderStep(state);
      }

      case 'EMERGENCY_INFO': {
        if (digit === '*') {
          state.currentStep = 'MAIN_MENU';
        }
        return this.renderStep(state);
      }

      default:
        state.currentStep = 'LANGUAGE_SELECT';
        return this.renderStep(state);
    }
  }

  public async renderStep(state: IvrState): Promise<IvrPromptResult> {
    const store = getDataStore();
    const isTe = state.language === 'te';

    switch (state.currentStep) {
      case 'LANGUAGE_SELECT':
        return {
          state,
          promptText: `Welcome to the ${APP_CONFIG.name} IVR Simulation Hotline.\n\nPress 1 for English.\nతెలుగు కోసం 2 నొక్కండి.`,
          spokenAudioText: `Welcome to ${APP_CONFIG.name}. Press 1 for English. తెలుగు కొరకు 2 నొక్కండి.`,
          availableOptions: [
            { key: '1', label: 'English', actionDesc: 'Select English language' },
            { key: '2', label: 'తెలుగు (Telugu)', actionDesc: 'తెలుగు భాషను ఎంచుకోండి' },
          ],
        };

      case 'MAIN_MENU':
        if (isTe) {
          return {
            state,
            promptText: `${APP_CONFIG.name} ముఖ్య విభాగాలకు స్వాగతం:\n1: ఆసుపత్రుల వివరాలు\n2: వైద్య విభాగాలు మరియు సేవలు\n3: అత్యవసర సేవల హెల్ప్‌లైన్\n9: భాషను మార్చుకోండి`,
            spokenAudioText: `ఆసుపత్రుల వివరాల కొరకు 1, వైద్య విభాగాల కొరకు 2, అత్యవసర సేవల కొరకు 3, భాష మార్పు కొరకు 9 నొక్కండి.`,
            availableOptions: [
              { key: '1', label: 'ఆసుపత్రులు', actionDesc: 'ఆసుపత్రుల జాబితా మరియు సమయాలు' },
              { key: '2', label: 'విభాగాలు', actionDesc: 'క్లినికల్ విభాగాలు' },
              { key: '3', label: 'అత్యవసరం', actionDesc: '24/7 ఎమర్జెన్సీ వివరాలు' },
              { key: '9', label: 'భాష మార్పు', actionDesc: 'తిరిగి భాష ఎంపికకు వెళ్లండి' },
            ],
          };
        }
        return {
          state,
          promptText: `${APP_CONFIG.name} Main Navigation Menu:\n1: Hospital & Facility Directory\n2: Medical Departments & Services\n3: Emergency & 24/7 Casualty Services\n9: Change Language Selection`,
          spokenAudioText: `For Hospital directory press 1. For departments press 2. For emergency assistance press 3. To change language press 9.`,
          availableOptions: [
            { key: '1', label: 'Hospitals Directory', actionDesc: 'Browse facilities by location' },
            { key: '2', label: 'Departments', actionDesc: 'Clinical specialties' },
            { key: '3', label: 'Emergency Info', actionDesc: '24/7 trauma & ambulance' },
            { key: '9', label: 'Change Language', actionDesc: 'Switch between English and Telugu' },
          ],
        };

      case 'HOSPITALS_MENU': {
        const topHospitals = (await store.getHospitals({ activeOnly: true })).slice(0, 4);
        const options: IvrMenuOption[] = topHospitals.map((h, i) => ({
          key: String(i + 1),
          label: h.name,
          actionDesc: `${h.locality}, ${h.city}`,
        }));
        options.push({ key: '*', label: isTe ? 'వెనుకకు' : 'Main Menu', actionDesc: 'Return' });

        const promptText = isTe
          ? `ఆసుపత్రి వివరాల కోసం సంబంధిత సంఖ్యను నొక్కండి:\n` +
            topHospitals.map((h, i) => `${i + 1}: ${h.name} (${h.city})`).join('\n') +
            `\n*: ప్రధాన మెనూకు వెళ్లండి`
          : `Select a facility to hear operating hours and address:\n` +
            topHospitals.map((h, i) => `${i + 1}: ${h.name} (${h.city})`).join('\n') +
            `\n*: Back to Main Menu`;

        return {
          state,
          promptText,
          spokenAudioText: promptText.replace(/\n/g, '. '),
          availableOptions: options,
        };
      }

      case 'HOSPITAL_DETAILS': {
        const hosp = state.selectedHospitalId
          ? await store.getHospitalById(state.selectedHospitalId)
          : null;
        if (!hosp) {
          state.currentStep = 'HOSPITALS_MENU';
          return this.renderStep(state);
        }

        const promptText = isTe
          ? `ఆసుపత్రి వివరాలు:\nపేరు: ${hosp.name}\nచిరునామా: ${hosp.address}, ${hosp.city}\nఫోన్: ${
              hosp.phone || 'లభ్యం కాలేదు'
            }\nపనివేళలు: ${hosp.operating_hours || '24 గంటలు'}\nఅత్యవసరం: ${
              hosp.emergency_information || 'అందుబాటులో ఉంది'
            }\nధృవీకరణ: ${
              hosp.verification_status === 'verified' ? 'ధృవీకరించబడింది' : 'నమూనా రికార్డు'
            }\n\n*: ఆసుపత్రుల జాబితాకు\n#: ప్రధాన మెనూకు`
          : `Facility Details:\nName: ${hosp.name}\nAddress: ${hosp.address}, ${hosp.city}\nPhone: ${
              hosp.phone || 'Not available'
            }\nHours: ${hosp.operating_hours || 'Standard hours'}\nEmergency: ${
              hosp.emergency_information || 'Available'
            }\nStatus: ${
              hosp.verification_status === 'verified' ? 'Verified' : 'Sample Record'
            }\n\n*: Back to Hospitals\n#: Main Menu`;

        return {
          state,
          promptText,
          spokenAudioText: promptText.replace(/\n/g, '. '),
          availableOptions: [
            { key: '*', label: isTe ? 'ఆసుపత్రుల జాబితా' : 'Back to Hospitals', actionDesc: 'Back' },
            { key: '#', label: isTe ? 'ప్రధాన మెనూ' : 'Main Menu', actionDesc: 'Home' },
          ],
        };
      }

      case 'DEPARTMENTS_MENU': {
        const depts = (await store.getDepartments()).slice(0, 4);
        const promptText = isTe
          ? `అందుబాటులో ఉన్న ముఖ్య విభాగాలు:\n` +
            depts.map((d, i) => `${i + 1}: ${d.name} (${d.hospital_name})`).join('\n') +
            `\n*: ప్రధాన మెనూకు వెళ్లండి`
          : `Connected Medical Departments:\n` +
            depts.map((d, i) => `${i + 1}: ${d.name} (${d.hospital_name})`).join('\n') +
            `\n*: Return to Main Menu`;

        return {
          state,
          promptText,
          spokenAudioText: promptText.replace(/\n/g, '. '),
          availableOptions: [
            ...depts.map((d, i) => ({
              key: String(i + 1),
              label: d.name,
              actionDesc: d.hospital_name || '',
            })),
            { key: '*', label: isTe ? 'ప్రధాన మెనూ' : 'Main Menu', actionDesc: 'Return' },
          ],
        };
      }

      case 'EMERGENCY_INFO': {
        const promptText = isTe
          ? `అత్యవసర సమాచారం:\nతీవ్రమైన వైద్య అత్యవసర పరిస్థితుల్లో వెంటనే 108 లేదా 112 కు కాల్ చేయండి.\n24/7 ఎమర్జెన్సీ మరియు ట్రామా కేర్ అందుబాటులో ఉన్న ఆసుపత్రి: Charminar Community Hospital, ఫోన్: +91-40-555-0101.\n\n*: ప్రధాన మెనూకు వెళ్లండి`
          : `EMERGENCY ALERT:\nIn a severe medical emergency, please hang up immediately and dial 108 or 112.\nNearest 24/7 Trauma and Casualty Centre: Charminar Community Hospital, Moghalpura, Hyderabad. Phone: +91-40-555-0101.\n\n*: Return to Main Menu`;

        return {
          state,
          promptText,
          spokenAudioText: promptText.replace(/\n/g, '. '),
          availableOptions: [
            { key: '*', label: isTe ? 'ప్రధాన మెనూ' : 'Main Menu', actionDesc: 'Return' },
          ],
        };
      }
    }
  }
}

export function getIvrService(): IvrSimulationService {
  return IvrSimulationService.getInstance();
}
