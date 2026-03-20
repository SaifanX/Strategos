import { Object3DNode, MaterialNode } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    agentMaterial: MaterialNode<any, any>;
  }
}
