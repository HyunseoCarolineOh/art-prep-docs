export type Artwork = {
  id: string
  image_url: string
  university: string
  region: string
  exam_type: string
  artwork_type: string
  year: number | null
  tags: string[]
  success_score: number
  created_at: string
  analysis_reports?: AnalysisReport[]
}

export type FormElement = {
  score: number
  comment: string
}

export type AnalysisReport = {
  id: string
  artwork_id: string
  intention: string
  school_tendency: string
  form_elements: {
    composition: FormElement
    form: FormElement
    color: FormElement
    expression: FormElement
  }
  evaluation_fit: string
  score: number
  summary: string
  improvement: string
  created_at: string
}

export type UserGoal = {
  user_id: string
  target_university: string
  exam_type: string
  artwork_type: string
  created_at?: string
}

export type SavedArtwork = {
  user_id: string
  artwork_id: string
  created_at: string
  artworks?: Artwork
}
