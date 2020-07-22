import SoundAssets from '../assets/SoundAssets';
import { ItemId } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameManager from '../scenes/gameManager/GameManager';
import SourceAcademyGame from '../SourceAcademyGame';
import { textTypeWriterStyle } from './GameDialogueConstants';
import DialogueGenerator from './GameDialogueGenerator';
import DialogueRenderer from './GameDialogueRenderer';
import DialogueSpeakerRenderer from './GameDialogueSpeakerRenderer';
import { Dialogue } from './GameDialogueTypes';

/**
 * Given a dialogue Id, this manager renders the correct dialogue.
 * It displays the lines, speakers, and performs actions
 * whenever players click on the dialogue box
 */
export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;
  private username: string;

  private speakerRenderer?: DialogueSpeakerRenderer;
  private dialogueRenderer?: DialogueRenderer;
  private dialogueGenerator?: DialogueGenerator;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
    this.username = '';
  }

  public initialise(gameManager: GameManager) {
    this.username = SourceAcademyGame.getInstance().getAccountInfo().name;
    this.dialogueMap = gameManager.getCurrentCheckpoint().map.getDialogues();
  }

  /**
   * @param dialogueId the dialogue Id of the dialogue you want to play
   *
   * @returns {Promise} the promise that resolves when the entire dialogue has been played
   */
  public async showDialogue(dialogueId: ItemId): Promise<void> {
    const dialogue = this.dialogueMap.get(dialogueId);
    if (!dialogue) return;
    this.dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    this.dialogueGenerator = new DialogueGenerator(dialogue.content);
    this.speakerRenderer = new DialogueSpeakerRenderer(this.username);

    GameGlobalAPI.getInstance().addContainerToLayer(
      Layer.Dialogue,
      this.dialogueRenderer.getDialogueContainer()
    );
    GameGlobalAPI.getInstance().fadeInLayer(Layer.Dialogue);
    await new Promise(resolve => this.playWholeDialogue(resolve));
  }

  private async playWholeDialogue(resolve: () => void) {
    await this.showNextLine(resolve);
    this.getDialogueRenderer()
      .getDialogueBox()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
        GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);
        await this.showNextLine(resolve);
      });
  }

  private async showNextLine(resolve: () => void) {
    const { line, speakerDetail, actionIds } = this.getDialogueGenerator().generateNextLine();
    const lineWithName = line.replace('{name}', this.username);
    this.getDialogueRenderer().changeText(lineWithName);
    this.getSpeakerRenderer().changeSpeakerTo(speakerDetail);
    await GameGlobalAPI.getInstance().processGameActionsInSamePhase(actionIds);
    if (!line) {
      resolve();
      this.getDialogueRenderer().destroy();
      this.getSpeakerRenderer().changeSpeakerTo(null);
    }
  }

  private getDialogueGenerator = () => this.dialogueGenerator as DialogueGenerator;
  private getDialogueRenderer = () => this.dialogueRenderer as DialogueRenderer;
  private getSpeakerRenderer = () => this.speakerRenderer as DialogueSpeakerRenderer;
}