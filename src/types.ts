export interface AngularFeatures {
  modules: number;
  services: number;
  components: {
    total: number;
    standalone: number;
    notStandalone: number;
    onPush: number;
    default: number;
  };
  directives: {
    total: number;
    standalone: number;
    notStandalone: number;
  };
  pipes: {
    total: number;
    standalone: number;
    notStandalone: number;
  };
}
