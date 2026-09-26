--[[
╔══════════════════════════════════════════════════════════════════╗
║                     XYUREI X-FLOID                               ║
║                 RENDERED EGGS ESP + TELEPORT                     ║
║                    UI: RAYFIELD GEN2                             ║
╚══════════════════════════════════════════════════════════════════╝
]]

--==============================================================
-- RAYFIELD GEN2 LOADER
--==============================================================
local Rayfield = loadstring(game:HttpGet("https://sirius.menu/gen2"))()

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

local RenderedEggs = workspace:FindFirstChild("RenderedEggs")
local Plots = workspace:FindFirstChild("Plots")

if not RenderedEggs then
    warn("[XYUREI X-FLOID] workspace.RenderedEggs was not found")
    return
end

if not Plots then
    warn("[XYUREI X-FLOID] workspace.Plots was not found")
end


--==============================================================
-- SETTINGS
--==============================================================

local UPDATE_RATE = 0.20
local HEIGHT_OFFSET = 10
local SHOW_HIGHLIGHT = true


--==============================================================
-- STATE
--==============================================================

local Running = true
local GlobalESPEnabled = true

local ESPs = {}
local EggEntries = {}
local EggGroups = {}
local Connections = {}

local SelectedEgg = nil

local Character = nil
local RootPart = nil

local PlotScanCount = 0
local CachedMyPlot = nil
local CachedBaseplate = nil

local MAX_PLOT_SCANS = 2

local updateSearch = nil
local getEggTopCFrame = nil
local safeTeleport = nil

local scanMyPlot = nil
local getMyPlot = nil
local getMyPlotBaseplate = nil
local getBaseplateTopCFrame = nil
local registerModel = nil


--==============================================================
-- UTILITY
--==============================================================

local function isFiniteNumber(value)
    return typeof(value) == "number" and value == value and value > -math.huge and value < math.huge
end


local function isValidPosition(position)
    if typeof(position) ~= "Vector3" then
        return false
    end
    return isFiniteNumber(position.X) and isFiniteNumber(position.Y) and isFiniteNumber(position.Z)
end


local function getCharacter()
    Character = LocalPlayer.Character
    if not Character then
        RootPart = nil
        return nil
    end
    RootPart = Character:FindFirstChild("HumanoidRootPart")
        or Character:FindFirstChild("UpperTorso")
        or Character:FindFirstChild("Torso")
    return Character
end


getCharacter()


--==============================================================
-- CHARACTER
--==============================================================

Connections.CharacterAdded = LocalPlayer.CharacterAdded:Connect(function(character)
    Character = character
    RootPart = character:WaitForChild("HumanoidRootPart", 10)
end)


--==============================================================
-- FIND ROOT PART
--==============================================================

local function getRootPart(model)

    if not model or not model:IsA("Model") then
        return nil
    end

    if model.PrimaryPart and model.PrimaryPart:IsA("BasePart") then
        return model.PrimaryPart
    end

    local root = model:FindFirstChild("HumanoidRootPart")
        or model:FindFirstChild("RootPart")
        or model:FindFirstChild("Handle")

    if root and root:IsA("BasePart") then
        return root
    end

    return model:FindFirstChildWhichIsA("BasePart", true)
end


--==============================================================
-- GROUP ESP STATE
--==============================================================

local function getEggTypeEnabled(model)

    if not model then
        return true
    end

    local group = EggGroups[model.Name]

    if group then
        return group.TypeESPEnabled
    end

    return true
end


--==============================================================
-- RAYFIELD GEN2 WINDOW
--==============================================================

local Window = Rayfield:CreateWindow({
    name = "XYUREI X-FLOID",
    subtitle = "Rendered Eggs • ESP & Teleport",
    sidebarLayout = true,
    theme = "default",
    icon = 93364949241311,
    configuration = {
        autoSave = false,
        autoLoad = false,
        fileName = "RenderedEggs",
        customFolder = "RenderedEggs",
    },
})


--==============================================================
-- TABS (GEN2 API)
--==============================================================

local MainTab = Window:CreateTab({ name = "Main", icon = 93364949241311 })
local ControlsTab = Window:CreateTab({ name = "Controls", icon = 93364949241311 })
local SearchTab = Window:CreateTab({ name = "Search", icon = 93364949241311 })
local EggsTab = Window:CreateTab({ name = "Eggs List", icon = 93364949241311 })
local SocialTab = Window:CreateTab({ name = "Social", icon = 93364949241311 })


--==============================================================
-- MAIN TAB CONTENT
--==============================================================

MainTab:CreateSection({ name = "System Status" })

local StatusText = MainTab:CreateText({
    name = "Status",
    text = "Online • Watching for new Eggs",
})

local CountStat = MainTab:CreateStat({
    name = "Egg Count",
    value = 0,
})

MainTab:CreateSection({ name = "Selected Egg" })

local SelectedText = MainTab:CreateText({
    name = "Selected",
    text = "No egg selected",
})


--==============================================================
-- CONTROLS TAB CONTENT
--==============================================================

ControlsTab:CreateSection({ name = "Global Controls" })

ControlsTab:CreateToggle({
    name = "Global ESP",
    flag = "GlobalESP",
    value = true,
    callback = function(value)

        GlobalESPEnabled = value

        for model, esp in pairs(ESPs) do
            if esp then
                local group = EggGroups[model.Name]

                local enabled = GlobalESPEnabled and (not group or group.TypeESPEnabled)

                esp.Billboard.Enabled = enabled

                if esp.Highlight then
                    esp.Highlight.Enabled = enabled
                end
            end
        end

    end,
})

ControlsTab:CreateButton({
    name = "Teleport To My Plot",
    callback = function()

        if not Running then return end

        getCharacter()

        if not Character or not RootPart then
            Window:Notify({
                title = "Error",
                content = "Character not found",
            })
            return
        end

        if not getMyPlotBaseplate then
            Window:Notify({
                title = "Error",
                content = "Plot function not ready",
            })
            return
        end

        local baseplate = getMyPlotBaseplate()

        if not baseplate then
            Window:Notify({
                title = "Error",
                content = "Your Plot was not found",
            })
            return
        end

        local target = getBaseplateTopCFrame(baseplate)

        if not target then
            Window:Notify({
                title = "Error",
                content = "Invalid Baseplate",
            })
            return
        end

        local success, reason = safeTeleport(Character, RootPart, target)

        if success then
            Window:Notify({
                title = "Teleported",
                content = "Teleported to My Plot",
            })
        else
            Window:Notify({
                title = "Teleport Failed",
                content = tostring(reason),
            })
        end

    end,
})

ControlsTab:CreateButton({
    name = "Refresh Egg List",
    callback = function()

        for _, object in ipairs(RenderedEggs:GetDescendants()) do
            if object:IsA("Model") then
                registerModel(object)
            end
        end

        if updateSearch then
            updateSearch()
        end

        Window:Notify({
            title = "Refreshed",
            content = "Egg list refreshed",
        })

    end,
})


--==============================================================
-- SEARCH TAB CONTENT
--==============================================================

SearchTab:CreateSection({ name = "Search Eggs" })

local SearchValue = ""

SearchTab:CreateInput({
    name = "Search Egg Type",
    placeholder = "Type egg name...",
    removeTextAfterFocusLost = false,
    callback = function(text)

        SearchValue = string.lower(text or "")

        if updateSearch then
            updateSearch()
        end

    end,
})


--==============================================================
-- EGGS LIST TAB CONTENT
--==============================================================

EggsTab:CreateSection({ name = "All Eggs (Grouped by Type)" })


--==============================================================
-- SOCIAL TAB CONTENT
--==============================================================

SocialTab:CreateSection({ name = "Community" })

SocialTab:CreateText({
    name = "Join Our Community",
    text = "Klik tombol di bawah untuk copy link WhatsApp Channel XYUREI TEAM",
})

SocialTab:CreateButton({
    name = "XYUREI TEAM",
    callback = function()

        local link = "https://whatsapp.com/channel/0029Vb8PMTg002T9Y4eIut2E"

        local success = false

        -- Coba setclipboard (Delta, Synapse, Krnl, dll)
        if typeof(setclipboard) == "function" then
            success = pcall(function()
                setclipboard(link)
            end)
        end

        -- Fallback toclipboard
        if not success and typeof(toclipboard) == "function" then
            success = pcall(function()
                toclipboard(link)
            end)
        end

        -- Fallback Clipboard.set
        if not success and Clipboard and Clipboard.set then
            success = pcall(function()
                Clipboard.set(link)
            end)
        end

        if success then
            Window:Notify({
                title = "XYUREI TEAM",
                content = "Link copied! Paste di browser / WhatsApp.",
            })
        else
            Window:Notify({
                title = "XYUREI TEAM",
                content = "Gagal copy link. Cek console.",
            })
            warn("[XYUREI X-FLOID] Clipboard failed. Link: " .. link)
        end

    end,
})

SocialTab:CreateText({
    name = "Link Info",
    text = "https://whatsapp.com/channel/0029Vb8PMTg002T9Y4eIut2E",
})


--==============================================================
-- CREATE ESP
--==============================================================

local function createESP(model)

    if not model or not model:IsA("Model") or not model.Parent then
        return
    end

    if ESPs[model] then
        return
    end

    local root = getRootPart(model)

    if not root then
        return
    end

    local billboard = Instance.new("BillboardGui")
    billboard.Name = "EggESP"
    billboard.Adornee = root
    billboard.AlwaysOnTop = true
    billboard.Size = UDim2.new(0, 190, 0, 44)
    billboard.StudsOffset = Vector3.new(0, 2.5, 0)
    billboard.Enabled = GlobalESPEnabled and getEggTypeEnabled(model)
    billboard.Parent = root

    local label = Instance.new("TextLabel")
    label.Name = "Info"
    label.Size = UDim2.fromScale(1, 1)
    label.BackgroundTransparency = 1
    label.Font = Enum.Font.GothamBold
    label.TextSize = 13
    label.TextColor3 = Color3.fromRGB(80, 210, 255)
    label.TextStrokeColor3 = Color3.fromRGB(0, 40, 90)
    label.TextStrokeTransparency = 0.15
    label.Text = model.Name
    label.Parent = billboard

    local highlight = nil

    if SHOW_HIGHLIGHT then
        highlight = Instance.new("Highlight")
        highlight.Name = "EggHighlight"
        highlight.FillColor = Color3.fromRGB(0, 170, 255)
        highlight.OutlineColor = Color3.fromRGB(80, 210, 255)
        highlight.FillTransparency = 0.78
        highlight.OutlineTransparency = 0.1
        highlight.Adornee = model
        highlight.Enabled = GlobalESPEnabled and getEggTypeEnabled(model)
        highlight.Parent = model
    end

    ESPs[model] = {
        Billboard = billboard,
        Label = label,
        Highlight = highlight
    }

end


--==============================================================
-- DESTROY ESP
--==============================================================

local function destroyESP(model)

    local esp = ESPs[model]

    if not esp then
        return
    end

    if esp.Billboard then
        esp.Billboard:Destroy()
    end

    if esp.Highlight then
        esp.Highlight:Destroy()
    end

    ESPs[model] = nil

end


--==============================================================
-- CREATE GROUP
--==============================================================

local function createEggGroup(groupName)

    if EggGroups[groupName] then
        return EggGroups[groupName]
    end

    local group = {
        Name = groupName,
        Eggs = {},
        TypeESPEnabled = true,
        TypeESPToggle = nil,
        CountStat = nil,
        EggUIRefs = {},
    }

    EggsTab:CreateSection({ name = groupName })

    local countStat = EggsTab:CreateStat({
        name = "Eggs in " .. groupName,
        value = 0,
    })

    local typeToggle = EggsTab:CreateToggle({
        name = "ESP for " .. groupName,
        flag = "ESP_" .. groupName,
        value = true,
        callback = function(value)

            group.TypeESPEnabled = value

            for model in pairs(group.Eggs) do

                local esp = ESPs[model]

                if esp then

                    local enabled = GlobalESPEnabled and group.TypeESPEnabled

                    esp.Billboard.Enabled = enabled

                    if esp.Highlight then
                        esp.Highlight.Enabled = enabled
                    end

                end

            end

        end,
    })

    group.CountStat = countStat
    group.TypeESPToggle = typeToggle

    EggGroups[groupName] = group

    return group

end


--==============================================================
-- CREATE EGG ENTRY
--==============================================================

local function createEggEntry(model)

    if EggEntries[model] then
        return
    end

    if not model or not model:IsA("Model") or not model.Parent then
        return
    end

    local group = createEggGroup(model.Name)

    group.Eggs[model] = true

    local nameText = EggsTab:CreateText({
        name = model.Name,
        text = "Waiting for data...",
    })

    local selectBtn = EggsTab:CreateButton({
        name = "Select " .. model.Name,
        callback = function()

            if not model or not model.Parent then
                return
            end

            SelectedEgg = model

            SelectedText:Set("Selected: " .. model.Name)

            Window:Notify({
                title = "Selected",
                content = model.Name .. " selected",
            })

        end,
    })

    local tpBtn = EggsTab:CreateButton({
        name = "Teleport to " .. model.Name,
        callback = function()

            if not Running then return end

            if not model or not model.Parent then
                Window:Notify({
                    title = "Error",
                    content = "Egg no longer exists",
                })
                return
            end

            getCharacter()

            if not Character or not RootPart then
                Window:Notify({
                    title = "Error",
                    content = "Character not found",
                })
                return
            end

            local target = getEggTopCFrame(model)

            if not target then
                Window:Notify({
                    title = "Error",
                    content = "Egg is not ready",
                })
                return
            end

            local success, reason = safeTeleport(Character, RootPart, target)

            if success then

                SelectedEgg = model
                SelectedText:Set("Selected: " .. model.Name)

                Window:Notify({
                    title = "Teleported",
                    content = "Teleported to " .. model.Name,
                })

            else

                Window:Notify({
                    title = "Teleport Failed",
                    content = tostring(reason),
                })

            end

        end,
    })

    local entry = {
        Model = model,
        NameText = nameText,
        Select = selectBtn,
        TP = tpBtn,
        UIRefs = { nameText, selectBtn, tpBtn },
        Group = group,
    }

    EggEntries[model] = entry
    group.EggUIRefs[model] = entry

end


--==============================================================
-- REGISTER MODEL
--==============================================================

registerModel = function(model)

    if not Running then
        return
    end

    if not model or not model:IsA("Model") or not model.Parent then
        return
    end

    if not model:IsDescendantOf(RenderedEggs) then
        return
    end

    if not EggEntries[model] then
        createEggEntry(model)
    end

    if not ESPs[model] then
        createESP(model)
    end

    if updateSearch then
        updateSearch()
    end

end


--==============================================================
-- NEW EGG SPAWN HANDLER
--==============================================================

local function tryRegisterEgg(object)

    if not Running then
        return
    end

    if not object or not object:IsA("Model") then
        return
    end

    if not object:IsDescendantOf(RenderedEggs) then
        return
    end

    task.defer(function()

        if not Running or not object.Parent or not object:IsDescendantOf(RenderedEggs) then
            return
        end

        local deadline = os.clock() + 2

        repeat

            if not Running or not object.Parent or not object:IsDescendantOf(RenderedEggs) then
                return
            end

            if getRootPart(object) then
                break
            end

            task.wait(0.05)

        until os.clock() >= deadline

        if not Running or not object.Parent or not object:IsDescendantOf(RenderedEggs) then
            return
        end

        registerModel(object)

    end)

end


--==============================================================
-- INITIAL SCAN
--==============================================================

for _, object in ipairs(RenderedEggs:GetDescendants()) do
    if object:IsA("Model") then
        registerModel(object)
    end
end


--==============================================================
-- NEW DESCENDANTS
--==============================================================

Connections.DescendantAdded = RenderedEggs.DescendantAdded:Connect(function(object)
    tryRegisterEgg(object)
end)


--==============================================================
-- EGG TOP CFRAME
--==============================================================

getEggTopCFrame = function(egg)

    if not egg or not egg:IsA("Model") or not egg.Parent then
        return nil
    end

    local cf, size = egg:GetBoundingBox()

    if not isValidPosition(cf.Position) then
        return nil
    end

    if not isFiniteNumber(size.Y) or size.Y <= 0 then
        return nil
    end

    local targetPosition = Vector3.new(
        cf.Position.X,
        cf.Position.Y + (size.Y * 0.5) + HEIGHT_OFFSET,
        cf.Position.Z
    )

    if not isValidPosition(targetPosition) then
        return nil
    end

    return CFrame.new(targetPosition)

end


--==============================================================
-- SAFE TELEPORT
--==============================================================

safeTeleport = function(character, root, targetCFrame)

    if not character or not character.Parent then
        return false, "Character is invalid"
    end

    if not root or not root.Parent then
        return false, "RootPart is invalid"
    end

    if not targetCFrame then
        return false, "Target is invalid"
    end

    local targetPosition = targetCFrame.Position

    if not isValidPosition(targetPosition) then
        return false, "Target position is invalid"
    end

    root.AssemblyLinearVelocity = Vector3.zero
    root.AssemblyAngularVelocity = Vector3.zero

    character:PivotTo(targetCFrame)

    root.AssemblyLinearVelocity = Vector3.zero
    root.AssemblyAngularVelocity = Vector3.zero

    return true

end


--==============================================================
-- FIND MY PLOT
--==============================================================

scanMyPlot = function()

    if not Plots then
        return nil
    end

    if PlotScanCount >= MAX_PLOT_SCANS then
        return CachedMyPlot
    end

    PlotScanCount += 1

    CachedMyPlot = nil
    CachedBaseplate = nil

    for _, plot in ipairs(Plots:GetChildren()) do

        local data = plot:FindFirstChild("Data")

        if data then

            local owner = data:FindFirstChild("Owner")

            if owner and owner:IsA("ObjectValue") and owner.Value == LocalPlayer then

                CachedMyPlot = plot

                local baseplate = plot:FindFirstChild("Baseplate")

                if not baseplate then
                    baseplate = plot:FindFirstChild("Baseplate", true)
                end

                if baseplate and baseplate:IsA("BasePart") then
                    CachedBaseplate = baseplate
                end

                break

            end

        end

    end

    return CachedMyPlot

end


--==============================================================
-- GET MY PLOT
--==============================================================

getMyPlot = function()

    if CachedMyPlot and CachedMyPlot.Parent then

        local data = CachedMyPlot:FindFirstChild("Data")

        local owner = data and data:FindFirstChild("Owner")

        if owner and owner:IsA("ObjectValue") and owner.Value == LocalPlayer then
            return CachedMyPlot
        end

    end

    return scanMyPlot()

end


--==============================================================
-- GET BASEPLATE
--==============================================================

getMyPlotBaseplate = function()

    local plot = getMyPlot()

    if not plot then
        return nil
    end

    if CachedBaseplate and CachedBaseplate.Parent and CachedBaseplate:IsDescendantOf(plot) then
        return CachedBaseplate
    end

    local baseplate = plot:FindFirstChild("Baseplate")

    if not baseplate then
        baseplate = plot:FindFirstChild("Baseplate", true)
    end

    if baseplate and baseplate:IsA("BasePart") then
        CachedBaseplate = baseplate
        return baseplate
    end

    return nil

end


--==============================================================
-- BASEPLATE TOP
--==============================================================

getBaseplateTopCFrame = function(baseplate)

    if not baseplate or not baseplate:IsA("BasePart") or not baseplate.Parent then
        return nil
    end

    local size = baseplate.Size
    local cf = baseplate.CFrame

    if not isFiniteNumber(size.Y) or size.Y <= 0 then
        return nil
    end

    if not isValidPosition(cf.Position) then
        return nil
    end

    local verticalOffset = (size.Y * 0.5) + HEIGHT_OFFSET

    local target = cf * CFrame.new(0, verticalOffset, 0)

    if not isValidPosition(target.Position) then
        return nil
    end

    return target

end


--==============================================================
-- SEARCH
--==============================================================

updateSearch = function()

    local query = SearchValue or ""

    local groupHasMatch = {}

    for model, entry in pairs(EggEntries) do

        if entry and entry.Model and entry.Model.Parent and entry.UIRefs then

            local name = string.lower(entry.Model.Name)

            local matches = query == "" or string.find(name, query, 1, true) ~= nil

            for _, uiObj in ipairs(entry.UIRefs) do

                if uiObj then

                    if uiObj.SetVisible then
                        pcall(function()
                            uiObj:SetVisible(matches)
                        end)
                    end

                end

            end

            local group = EggGroups[entry.Model.Name]

            if group and matches then
                groupHasMatch[group] = true
            end

        end

    end

    for groupName, group in pairs(EggGroups) do

        local shouldShow = query == "" or groupHasMatch[group] == true

        if group.TypeESPToggle and group.TypeESPToggle.SetVisible then
            pcall(function()
                group.TypeESPToggle:SetVisible(shouldShow)
            end)
        end

        if group.CountStat and group.CountStat.SetVisible then
            pcall(function()
                group.CountStat:SetVisible(shouldShow)
            end)
        end

    end

end


--==============================================================
-- UPDATE LOOP
--==============================================================

task.spawn(function()

    while Running do

        getCharacter()

        local root = RootPart

        local totalEggs = 0

        for model, esp in pairs(ESPs) do

            if not model or not model.Parent or not model:IsDescendantOf(RenderedEggs) then

                destroyESP(model)

                local entry = EggEntries[model]

                if entry then

                    if entry.UIRefs then
                        for _, uiObj in ipairs(entry.UIRefs) do
                            if uiObj and uiObj.Destroy then
                                pcall(function() uiObj:Destroy() end)
                            end
                        end
                    end

                    EggEntries[model] = nil

                end

                local group = EggGroups[model.Name]

                if group then
                    group.Eggs[model] = nil
                    group.EggUIRefs[model] = nil
                end

            else

                totalEggs += 1

                local eggRoot = getRootPart(model)

                if eggRoot then

                    local distance = 0

                    if root then
                        distance = (root.Position - eggRoot.Position).Magnitude
                    end

                    local group = EggGroups[model.Name]

                    local groupEnabled = not group or group.TypeESPEnabled

                    local enabled = GlobalESPEnabled and groupEnabled

                    esp.Billboard.Enabled = enabled

                    if esp.Highlight then
                        esp.Highlight.Enabled = enabled
                    end

                    if root then
                        esp.Label.Text = model.Name .. "\n[" .. math.floor(distance) .. " studs]"
                    else
                        esp.Label.Text = model.Name
                    end

                    local entry = EggEntries[model]

                    if entry then

                        if entry.NameText and entry.NameText.Set then

                            pcall(function()

                                local distText = root and (" • " .. math.floor(distance) .. " studs") or ""

                                entry.NameText:Set(model.Name .. distText)

                            end)

                        end

                    end

                end

            end

        end

        pcall(function()
            CountStat:Set(totalEggs)
            StatusText:Set("Online • Plot scan " .. PlotScanCount .. "/" .. MAX_PLOT_SCANS)
        end)

        -- Update per-group counts
        for groupName, group in pairs(EggGroups) do
            pcall(function()
                local count = 0
                for _ in pairs(group.Eggs) do count += 1 end
                if group.CountStat and group.CountStat.Set then
                    group.CountStat:Set(count)
                end
            end)
        end

        task.wait(UPDATE_RATE)

    end

end)


--==============================================================
-- SHUTDOWN
--==============================================================

local function shutdown()

    if not Running then
        return
    end

    Running = false

    for model in pairs(ESPs) do
        destroyESP(model)
    end

    for _, connection in pairs(Connections) do
        if connection then
            pcall(function()
                connection:Disconnect()
            end)
        end
    end

    pcall(function()
        Rayfield:Destroy()
    end)

end


--==============================================================
-- START
--==============================================================

Window:Notify({
    title = "XYUREI X-FLOID",
    content = "ESP + Teleport loaded",
})

print("[XYUREI X-FLOID] ESP + Teleport loaded (Rayfield Gen2 UI)")