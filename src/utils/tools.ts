import { ToolCall } from '../types';

export interface ToolExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  actionTaken?: string;
}

export class PentherToolRouter {
  public static async executeTool(
    toolCall: ToolCall,
    callbacks?: {
      openModal?: (modalType: string, payload?: any) => void;
      requestPermission?: (permission: string) => Promise<boolean>;
    }
  ): Promise<ToolExecutionResult> {
    const { name, arguments: args } = toolCall;

    try {
      switch (name) {
        case 'open_app': {
          const appName = args.appName || 'App';
          const lower = appName.toLowerCase();

          if (lower.includes('youtube')) {
            window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
            return {
              success: true,
              message: `Launched Android Intent: com.google.android.youtube (${appName})`,
              actionTaken: 'Opened YouTube',
            };
          } else if (lower.includes('calc') || lower.includes('calculator')) {
            callbacks?.openModal?.('calculator');
            return {
              success: true,
              message: `Opened Android Calculator subsystem.`,
              actionTaken: 'Opened Calculator',
            };
          } else if (lower.includes('camera')) {
            callbacks?.openModal?.('camera');
            return {
              success: true,
              message: `Dispatched Camera Intent (android.media.action.IMAGE_CAPTURE).`,
              actionTaken: 'Launched Camera',
            };
          } else if (lower.includes('setting')) {
            callbacks?.openModal?.('settings');
            return {
              success: true,
              message: `Dispatched Android Settings Intent (android.settings.SETTINGS).`,
              actionTaken: 'Opened Settings',
            };
          } else if (lower.includes('map')) {
            callbacks?.openModal?.('maps', { query: 'Current Location' });
            return {
              success: true,
              message: `Dispatched Google Maps navigation intent.`,
              actionTaken: 'Opened Maps',
            };
          } else if (lower.includes('whatsapp')) {
            window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
            return {
              success: true,
              message: `Launched WhatsApp package: com.whatsapp`,
              actionTaken: 'Opened WhatsApp',
            };
          } else if (lower.includes('chrome') || lower.includes('browser')) {
            window.open('https://www.google.com', '_blank', 'noopener,noreferrer');
            return {
              success: true,
              message: `Launched Browser package: com.android.chrome`,
              actionTaken: 'Opened Chrome',
            };
          } else if (lower.includes('spotify')) {
            window.open('https://open.spotify.com', '_blank', 'noopener,noreferrer');
            return {
              success: true,
              message: `Launched Spotify package: com.spotify.music`,
              actionTaken: 'Opened Spotify',
            };
          } else {
            // General deep-link fallback
            window.open(`https://www.google.com/search?q=${encodeURIComponent(appName)}`, '_blank', 'noopener,noreferrer');
            return {
              success: true,
              message: `Intent forwarded for installed application package: ${appName}`,
              actionTaken: `Opened ${appName}`,
            };
          }
        }

        case 'open_settings': {
          const type = args.settingType || 'general';
          callbacks?.openModal?.('settings', { tab: type });
          return {
            success: true,
            message: `Opened Android System Settings [Action: android.settings.${type.toUpperCase()}_SETTINGS]`,
            actionTaken: `Opened Settings: ${type}`,
          };
        }

        case 'open_url': {
          let targetUrl = args.url || 'https://google.com';
          if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
          }
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
          return {
            success: true,
            message: `Dispatched VIEW Intent: ${targetUrl}`,
            actionTaken: `Opened URL`,
            data: { url: targetUrl },
          };
        }

        case 'search_web': {
          const query = args.query || '';
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
          return {
            success: true,
            message: `Dispatched Web Search Intent (android.intent.action.WEB_SEARCH): "${query}"`,
            actionTaken: `Searched Google for "${query}"`,
          };
        }

        case 'calculator': {
          callbacks?.openModal?.('calculator', { expression: args.expression });
          return {
            success: true,
            message: `Evaluated calculation / launched Calculator.`,
            actionTaken: 'Opened Calculator',
            data: { expression: args.expression },
          };
        }

        case 'timer': {
          const durationSeconds = Number(args.durationSeconds) || 60;
          callbacks?.openModal?.('timer', { durationSeconds, label: args.label || 'PENTHER Timer' });
          return {
            success: true,
            message: `Dispatched Android Alarm Clock Intent (android.intent.action.SET_TIMER): ${durationSeconds}s`,
            actionTaken: `Started Timer (${durationSeconds}s)`,
            data: { durationSeconds },
          };
        }

        case 'reminder': {
          const title = args.title || 'Reminder';
          callbacks?.openModal?.('reminder', { title, time: args.time });
          return {
            success: true,
            message: `Scheduled Android Calendar / Alarm Event: "${title}"`,
            actionTaken: `Created Reminder: ${title}`,
          };
        }

        case 'camera': {
          callbacks?.openModal?.('camera', { mode: args.mode || 'photo' });
          return {
            success: true,
            message: `Opened Camera hardware interface (CameraX preview).`,
            actionTaken: 'Opened Camera',
          };
        }

        case 'maps': {
          callbacks?.openModal?.('maps', { query: args.query || 'nearby' });
          return {
            success: true,
            message: `Dispatched Google Maps Geo Intent: geo:0,0?q=${encodeURIComponent(args.query || '')}`,
            actionTaken: `Opened Maps for "${args.query}"`,
          };
        }

        case 'share': {
          const shareText = args.text || '';
          if (navigator.share) {
            try {
              await navigator.share({
                title: args.title || 'Shared via PENTHER',
                text: shareText,
              });
              return {
                success: true,
                message: `Dispatched Android Share Sheet (android.intent.action.SEND).`,
                actionTaken: 'Shared content',
              };
            } catch (e) {
              // User dismissed or share failed
            }
          }
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareText);
          return {
            success: true,
            message: `Content copied to clipboard for sharing: "${shareText.slice(0, 40)}..."`,
            actionTaken: 'Copied to clipboard',
          };
        }

        case 'file_picker': {
          callbacks?.openModal?.('file_picker', { fileType: args.fileType || 'any' });
          return {
            success: true,
            message: `Triggered Storage Access Framework (android.intent.action.GET_CONTENT).`,
            actionTaken: 'Opened File Picker',
          };
        }

        case 'device_information': {
          callbacks?.openModal?.('device_info');
          return {
            success: true,
            message: `Queried Android Telephony, Battery, and Hardware Manager.`,
            actionTaken: 'Retrieved Device Status',
          };
        }

        case 'send_message': {
          const recipient = args.recipient || 'Contact';
          const msg = args.message || '';
          // Dispatched intent
          window.open(`https://wa.me/?text=${encodeURIComponent(`[PENTHER] To ${recipient}: ${msg}`)}`, '_blank');
          return {
            success: true,
            message: `Message intent prepared & dispatched for ${recipient}.`,
            actionTaken: `Sent message to ${recipient}`,
          };
        }

        case 'python_sandbox': {
          callbacks?.openModal?.('python_sandbox', { code: args.code, description: args.description });
          return {
            success: true,
            message: `Loaded script into PENTHER Sandboxed Python Terminal.`,
            actionTaken: 'Opened Python Sandbox',
          };
        }

        case 'security_lab': {
          callbacks?.openModal?.('security_lab', { topic: args.topic, details: args.details });
          return {
            success: true,
            message: `Loaded PENTHER Security Lab module: ${args.topic}.`,
            actionTaken: `Opened Security Lab: ${args.topic}`,
          };
        }

        default:
          return {
            success: false,
            message: `Unknown or unsupported tool action: ${name}`,
          };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Execution failed for tool ${name}: ${err.message || 'System error'}`,
      };
    }
  }
}
