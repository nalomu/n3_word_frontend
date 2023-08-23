// typings.d.ts or router.ts
import 'vue-router'
import { Router } from 'vue-router'

export {}

declare global {
  interface User {
    nickname: string;
    username: string;
    id: number;
    is_admin: number;
  }

  export interface Category {
    id: number;
    name: string;
  }


  interface Word {
    'word': string,
    'translation': string,
    'pronunciation': string,
    'remark': string,
    'audio': string,
    'id': number,
    'category_id': number,
    category: Category;
  }

  interface Feedback {
    audio_url: string;
    error_type: string;
    translate: null;
    status: string;
    id: number;
    user_id: number;
    user: User;
    word_id: number;
    word: Word;
  }

  interface QuestionRange {
    type: 'word' | 'category',
    range: number[]
  }

}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    auth?: boolean
  }
}
