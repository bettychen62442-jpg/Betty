-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'UNFAMILIAR',
    "categoryId" TEXT,
    "source" TEXT,
    "sourceCompany" TEXT,
    "timesReviewed" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("questionId", "tagId"),
    CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "round" TEXT NOT NULL DEFAULT 'OTHER',
    "interviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "resultReason" TEXT,
    "overallNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT,
    "questionText" TEXT,
    "selfScore" INTEGER,
    "wasCorrect" BOOLEAN,
    "interviewerNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterviewLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InterviewQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AudioRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "durationSeconds" INTEGER,
    "mimeType" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'UPLOADED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AudioRecording_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterviewLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "audioId" TEXT NOT NULL,
    "fullText" TEXT NOT NULL,
    "segments" TEXT,
    "language" TEXT,
    "providerName" TEXT,
    "providerMetadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transcript_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "AudioRecording" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtractedQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcriptId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT,
    "suggestedCategory" TEXT,
    "suggestedTags" TEXT,
    "suggestedDifficulty" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNote" TEXT,
    "promotedQuestionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExtractedQuestion_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExtractedQuestion_promotedQuestionId_fkey" FOREIGN KEY ("promotedQuestionId") REFERENCES "Question" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "easiness" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyCard_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "categoryId" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyIntel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "processNotes" TEXT,
    "commonQuestions" TEXT,
    "salaryNotes" TEXT,
    "cultureNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_audioId_key" ON "Transcript"("audioId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtractedQuestion_promotedQuestionId_key" ON "ExtractedQuestion"("promotedQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyCard_questionId_key" ON "StudyCard"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyIntel_company_key" ON "CompanyIntel"("company");
