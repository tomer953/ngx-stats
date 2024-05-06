export interface AngularFeatures {
  modules: number;
  services: number;
  components: {
    total: number;
    standalone: number;
    notStandalone: number;
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
