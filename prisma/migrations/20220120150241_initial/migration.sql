-- CreateTable
CREATE TABLE "Word" (
    "content" TEXT NOT NULL,
    "translationGroupId" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("content")
);

-- CreateTable
CREATE TABLE "TranslationGroup" (
    "id" TEXT NOT NULL,

    CONSTRAINT "TranslationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Language" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Sheet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lookedAtTimes" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "containsProfanity" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagsOnTranslationGroups" (
    "tagId" TEXT NOT NULL,
    "translationGroupId" TEXT NOT NULL,

    CONSTRAINT "TagsOnTranslationGroups_pkey" PRIMARY KEY ("tagId","translationGroupId")
);

-- CreateTable
CREATE TABLE "SheetsOnTranslationGroups" (
    "sheetId" TEXT NOT NULL,
    "translationGroupId" TEXT NOT NULL,

    CONSTRAINT "SheetsOnTranslationGroups_pkey" PRIMARY KEY ("sheetId","translationGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_content_key" ON "Word"("content");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationGroup_id_key" ON "TranslationGroup"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sheet_id_key" ON "Sheet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_translationGroupId_fkey" FOREIGN KEY ("translationGroupId") REFERENCES "TranslationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageName_fkey" FOREIGN KEY ("languageName") REFERENCES "Language"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sheet" ADD CONSTRAINT "Sheet_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnTranslationGroups" ADD CONSTRAINT "TagsOnTranslationGroups_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnTranslationGroups" ADD CONSTRAINT "TagsOnTranslationGroups_translationGroupId_fkey" FOREIGN KEY ("translationGroupId") REFERENCES "TranslationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetsOnTranslationGroups" ADD CONSTRAINT "SheetsOnTranslationGroups_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetsOnTranslationGroups" ADD CONSTRAINT "SheetsOnTranslationGroups_translationGroupId_fkey" FOREIGN KEY ("translationGroupId") REFERENCES "TranslationGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
